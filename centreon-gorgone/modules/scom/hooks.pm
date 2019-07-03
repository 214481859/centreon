# 
# Copyright 2019 Centreon (http://www.centreon.com/)
#
# Centreon is a full-fledged industry-strength solution that meets
# the needs in IT infrastructure and application monitoring for
# service performance.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

package modules::scom::hooks;

use warnings;
use strict;
use centreon::script::centreondcore;
use modules::scom::class;

my ($config_core, $config);
my $config_db_centstorage;
my $module_id = 'scom';
my $events = [
    'SCOMREADY', 
    'SCOMRESYNC',
];

my $last_containers = {}; # Last values from config ini
my $containers = {};
my $containers_pid = {};
my $stop = 0;
my $timer_check = time();
my $config_check_containers_time;

sub register {
    my (%options) = @_;
    
    $config = $options{config};
    $config_core = $options{config_core};
    $config_db_centstorage = $options{config_db_centstorage};
    $config_check_containers_time = defined($config->{check_containers_time}) ? $config->{check_containers_time} : 3600;
    return ($events, $module_id);
}

sub init {
    my (%options) = @_;

    $last_containers = get_containers(logger => $options{logger});
    foreach my $container_id (keys %$last_containers) {
        create_child(container_id => $container_id, logger => $options{logger});
    }
}

sub routing {
    my (%options) = @_;
    
    my $data;
    eval {
        $data = JSON->new->utf8->decode($options{data});
    };
    if ($@) {
        $options{logger}->writeLogError("Cannot decode json data: $@");
        centreon::centreond::common::add_history(
            dbh => $options{dbh},
            code => 200, token => $options{token},
            data => { message => 'scom: cannot decode json' },
            json_encode => 1
        );
        return undef;
    }
    
    if ($options{action} eq 'SCOMREADY') {
        $containers->{$data->{container_id}}->{ready} = 1;
        return undef;
    }
    
    if (!defined($data->{container_id}) || !defined($last_containers->{$data->{container_id}})) {
        centreon::centreond::common::add_history(
            dbh => $options{dbh},
            code => 200, token => $options{token},
            data => { message => 'scom: need a valid container id' },
            json_encode => 1
        );
        return undef;
    }
    
    if (centreon::script::centreondcore::waiting_ready(ready => \$containers->{$data->{container_id}}->{ready}) == 0) {
        centreon::centreond::common::add_history(
            dbh => $options{dbh},
             code => 200, token => $options{token},
             data => { message => 'scom: still no ready' },
             json_encode => 1
        );
        return undef;
    }
    
    centreon::centreond::common::zmq_send_message(
        socket => $options{socket}, identity => 'scom-' . $data->{container_id},
        action => $options{action}, data => $options{data}, token => $options{token},
    );
}

sub gently {
    my (%options) = @_;

    $stop = 1;
    foreach my $container_id (keys %$containers) {
        $options{logger}->writeLogInfo("scom: Send TERM signal for container '" . $container_id . "'");
        if ($containers->{$container_id}->{running} == 1) {
            CORE::kill('TERM', $containers->{$container_id}->{pid});
        }
    }
}

sub kill_internal {
    my (%options) = @_;

    foreach (keys %$containers) {
        if ($containers->{$_}->{running} == 1) {
            $options{logger}->writeLogInfo("scom: Send KILL signal for container '" . $_ . "'");
            CORE::kill('KILL', $containers->{$_}->{pid});
        }
    }
}

sub kill {
    my (%options) = @_;

    
}

sub check {
    my (%options) = @_;

    if ($timer_check - time() > $config_check_containers_time) {
        sync_container_childs(logger => $options{logger});
        $timer_check = time();
    }
    
    my $count = 0;
    foreach my $pid (keys %{$options{dead_childs}}) {
        # Not me
        next if (!defined($containers_pid->{$pid}));
        
        # If someone dead, we recreate
        delete $containers->{$containers_pid->{$pid}};
        delete $containers_pid->{$pid};
        delete $options{dead_childs}->{$pid};
        if ($stop == 0) {
            # Need to check if we need to recreate (can be a container destruction)!!!
            sync_container_childs(logger => $options{logger});
        }
    }
    
    return $count;
}

# Specific functions
sub get_containers {
    my (%options) = @_;

    my $containers = {};
    return $containers if (!defined($config->{containers}));
    foreach my $container_id (split /,/, $config->{containers}) {
        next if ($container_id eq '' || !defined($config->{$container_id . '_url'}));

        if (!defined($config->{$container_id . '_dsmhost'}) ||  $config->{$container_id . '_dsmhost'} eq '') {
            $options{logger}->writeLogError("scom: cannot load container '" . $container_id . "' - please set dsmhost option");
            next;
        }
        if (!defined($config->{$container_id . '_dsmslot'}) ||  $config->{$container_id . '_dsmslot'} eq '') {
            $options{logger}->writeLogError("scom: cannot load container '" . $container_id . "' - please set dsmslot option");
            next;
        }

        $containers->{$container_id} = {
            url => $config->{$container_id . '_url'},
            username => $config->{$container_id . '_username'},
            password => $config->{$container_id . '_password'},
            username => $config->{$container_id . '_username'},
            resync_time => 
                (defined($config->{$container_id . '_resync_time'}) && $config->{$container_id . '_resync_time'} =~ /(\d+)/) ? 
                $1 : 300,
            dsmhost => $config->{$container_id . '_dsmhost'},
            dsmslot => $config->{$container_id . '_dsmslot'},
            dsmmacro => defined($config->{$container_id . '_dsmmacro'}) ? $config->{$container_id . '_dsmmacro'} : 'ALARM_ID',
            dsmalertmessage => defined($config->{$container_id . '_dsmalertmessage'}) ? $config->{$container_id . '_dsmalertmessage'} : '%{monitoringobjectdisplayname} %{name}',
            dsmrecoverymessage => defined($config->{$container_id . '_dsmrecoverymessage'}) ? $config->{$container_id . '_dsmrecoverymessage'} : 'slot ok',
        };
    }

    return $containers;
}

sub sync_container_childs {
    my (%options) = @_;
    
    $last_containers = get_containers(logger => $options{logger});
    foreach my $container_id (keys %$last_containers) {
        if (!defined($containers->{$container_id})) {
            create_child(container_id => $container_id, logger => $options{logger});
        }
    }

    # Check if need to delete on containers
    foreach my $container_id (keys %$containers) {
        next if (defined($last_containers->{$container_id}));

        if ($containers->{$container_id}->{running} == 1) {
            $options{logger}->writeLogInfo("scom: Send KILL signal for container '" . $container_id . "'");
            CORE::kill('KILL', $containers->{$container_id}->{pid});
        }
        
        delete $containers_pid->{ $containers->{$container_id}->{pid} };
        delete $containers->{$container_id};
    }
}

sub create_child {
    my (%options) = @_;
    
    $options{logger}->writeLogInfo("Create scom for container '" . $options{container_id} . "'");
    my $child_pid = fork();
    if ($child_pid == 0) {
        $0 = 'centreond-scom';
        my $module = modules::scom::class->new(
            logger => $options{logger},
            config_core => $config_core,
            config => $config,
            config_db_centstorage => $config_db_centstorage,
            config_scom => $last_containers->{$options{container_id}},
            container_id => $options{container_id},
        );
        $module->run();
        exit(0);
    }
    $options{logger}->writeLogInfo("PID $child_pid scom for container '" . $options{container_id} . "'");
    $containers->{$options{container_id}} = { pid => $child_pid, ready => 0, running => 1 };
    $containers_pid->{$child_pid} = $options{container_id};
}

1;
