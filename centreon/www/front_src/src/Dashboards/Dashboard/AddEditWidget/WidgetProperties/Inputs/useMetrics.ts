import { ChangeEvent, useEffect, useMemo } from 'react';

import { useFormikContext } from 'formik';
import { all, equals, gt, innerJoin, isEmpty, isNil, pluck } from 'ramda';

import {
  ListingModel,
  SelectEntry,
  buildListingEndpoint,
  useDeepCompare,
  useFetchQuery
} from '@centreon/ui';

import {
  ServiceMetric,
  Widget,
  WidgetDataMetric,
  WidgetDataResource
} from '../../models';
import { metricsEndpoint } from '../../api/endpoints';
import { serviceMetricsDecoder } from '../../api/decoders';

import { getDataProperty } from './utils';

interface UseMetricsState {
  addMetric: () => void;
  changeMetric: (index) => (_, newMetrics: Array<SelectEntry> | null) => void;
  changeService: (index) => (e: ChangeEvent<HTMLInputElement>) => void;
  deleteMetric: (index: number | string) => () => void;
  getMetricsFromService: (serviceId: number) => Array<SelectEntry>;
  hasNoResources: () => boolean;
  hasTooManyMetrics: boolean;
  isLoadingMetrics: boolean;
  metricCount: number | undefined;
  serviceOptions: Array<SelectEntry>;
  value: Array<WidgetDataMetric>;
}

const useMetrics = (propertyName: string): UseMetricsState => {
  const { values, setFieldValue } = useFormikContext<Widget>();

  const resources = (values.data?.resources || []) as Array<WidgetDataResource>;

  const { data: servicesMetrics, isLoading: isLoadingMetrics } = useFetchQuery<
    ListingModel<ServiceMetric>
  >({
    decoder: serviceMetricsDecoder,
    getEndpoint: () =>
      buildListingEndpoint({
        baseEndpoint: metricsEndpoint,
        parameters: {
          search: {
            lists: resources.map((resource) => ({
              field: resource.resourceType,
              values: equals(resource.resourceType, 'service')
                ? pluck('name', resource.resources)
                : pluck('id', resource.resources)
            }))
          }
        }
      }),
    getQueryKey: () => ['metrics', JSON.stringify(resources)],
    queryOptions: {
      enabled:
        !isEmpty(resources) &&
        all((resource) => !isEmpty(resource.resources), resources),
      keepPreviousData: true,
      suspense: false
    }
  });

  const value = useMemo<Array<WidgetDataMetric> | undefined>(
    () => getDataProperty({ obj: values, propertyName }),
    [getDataProperty({ obj: values, propertyName })]
  );

  const hasTooManyMetrics = gt(servicesMetrics?.meta?.total || 0, 100);

  const serviceOptions = useMemo<Array<SelectEntry>>(
    () =>
      (servicesMetrics?.result || []).map((metric) => ({
        id: metric.serviceId,
        name: metric.resourceName
      })),
    [servicesMetrics?.result]
  );

  const metricCount = servicesMetrics?.meta?.total;

  const hasNoResources = (): boolean => {
    if (!resources.length) {
      return true;
    }

    return resources.every((resource) => !resource.resources.length);
  };

  const addMetric = (): void => {
    setFieldValue(`data.${propertyName}`, [
      ...(value || []),
      {
        metrics: [],
        serviceId: ''
      }
    ]);
  };

  const deleteMetric = (index: number | string) => (): void => {
    setFieldValue(
      `data.${propertyName}`,
      (value || []).filter((_, i) => !equals(i, index))
    );
  };

  const getMetricsFromService = (serviceId: number): Array<SelectEntry> => {
    return (
      (servicesMetrics?.result || []).find((metric) =>
        equals(metric.serviceId, serviceId)
      )?.metrics || []
    );
  };

  const changeService =
    (index) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      setFieldValue(`data.${propertyName}.${index}.serviceId`, e.target.value);
      setFieldValue(`data.${propertyName}.${index}.metrics`, []);
    };

  const changeMetric =
    (index) =>
    (_, newMetrics: Array<SelectEntry> | null): void => {
      setFieldValue(`data.${propertyName}.${index}.metrics`, newMetrics || []);
    };

  useEffect(() => {
    if (isNil(servicesMetrics) && isEmpty(resources)) {
      setFieldValue(`data.${propertyName}`, []);

      return;
    }

    const baseServiceIds = pluck('serviceId', servicesMetrics?.result || []);

    const intersectionBetweenServicesIdsAndValues = innerJoin(
      (service, id) => equals(service.serviceId, id),
      value || [],
      baseServiceIds
    );

    setFieldValue(
      `data.${propertyName}`,
      intersectionBetweenServicesIdsAndValues
    );
  }, useDeepCompare([servicesMetrics, resources]));

  return {
    addMetric,
    changeMetric,
    changeService,
    deleteMetric,
    getMetricsFromService,
    hasNoResources,
    hasTooManyMetrics,
    isLoadingMetrics,
    metricCount,
    serviceOptions,
    value: value || []
  };
};
export default useMetrics;
