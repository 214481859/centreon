import { useCallback, useEffect } from 'react';

import { useAtom } from 'jotai';
import { last, pipe, split } from 'ramda';

import { capitalize } from '@mui/material';

import { getData, useRequest, useDeepCompare } from '@centreon/ui';

import usePlatformVersions from '../Main/usePlatformVersions';

import { federatedWidgetsAtom } from './atoms';
import { FederatedModule } from './models';

export const formatWidgetName = pipe(
  split('centreon-widget-'),
  last,
  capitalize
);

export const getFederatedWidget = (moduleName: string): string => {
  return `./widgets/${formatWidgetName(
    moduleName
  )}/static/moduleFederation.json`;
};

interface UseFederatedModulesState {
  federatedWidgets: Array<FederatedModule> | null;
  getFederatedModulesConfigurations: () => void;
}

const useFederatedWidgets = (): UseFederatedModulesState => {
  const { sendRequest } = useRequest<FederatedModule>({
    request: getData
  });
  const [federatedWidgets, setFederatedWidgets] = useAtom(federatedWidgetsAtom);
  const { getWidgets } = usePlatformVersions();

  const widgets = getWidgets();

  const getFederatedModulesConfigurations = useCallback((): void => {
    if (!widgets) {
      return;
    }

    Promise.all(
      widgets?.map((moduleName) =>
        sendRequest({ endpoint: getFederatedWidget(moduleName) })
      ) || []
    ).then(setFederatedWidgets);
  }, [widgets]);

  useEffect(() => {
    getFederatedModulesConfigurations();
  }, useDeepCompare([widgets]));

  return {
    federatedWidgets,
    getFederatedModulesConfigurations
  };
};

export default useFederatedWidgets;
