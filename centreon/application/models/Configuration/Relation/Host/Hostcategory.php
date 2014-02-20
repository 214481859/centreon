<?php

namespace Models\Configuration\Relation\Host;

use \Models\Configuration\Relation;

class Hostcategory extends Relation
{
    protected $relationTable = "hostcategories_relation";
    protected $firstKey = "hostcategories_hc_id";
    protected $secondKey = "host_host_id";

    /**
     * Constructor
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->firstObject = new \Models\Configuration\Hostcategory();
        $this->secondObject = new \Models\Configuration\Host();
    }
}
