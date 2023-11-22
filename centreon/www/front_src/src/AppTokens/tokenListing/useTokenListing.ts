import { useEffect, useState } from 'react';

import { useAtom } from 'jotai';

import { useFetchQuery } from '@centreon/ui';

import { listTokensDecoder } from '../api/decoder';
import { buildListTokensEndpoint } from '../api/endpoints';

import { currentFilterAtom } from './actions/search/filter/atoms';
import { Fields, SortOrder } from './actions/search/filter/models';
import { DataListing, UseTokenListing } from './models';

export const useTokenListing = (): UseTokenListing => {
  const [dataListing, setDataListing] = useState<DataListing | undefined>();
  const [enabled, setEnabled] = useState(false);
  const [currentFilter, setCurrentFilter] = useAtom(currentFilterAtom);

  const getEndpoint = (): string => {
    return buildListTokensEndpoint({ parameters: currentFilter });
  };

  const { data, isLoading, isError, refetch } = useFetchQuery({
    decoder: listTokensDecoder,
    getEndpoint,
    getQueryKey: () => ['listTokens', currentFilter],
    queryOptions: {
      enabled,
      refetchOnMount: false,
      suspense: false
    }
  });

  const changeLimit = (value): void => {
    setCurrentFilter((prev) => ({ ...prev, limit: Number(value) }));
  };

  const changePage = (value): void => {
    setCurrentFilter((prev) => ({ ...prev, page: value + 1 }));
  };

  const onSort = (sortParams): void => {
    const { sortField, sortOrder } = sortParams;

    setCurrentFilter({ ...currentFilter, sort: { [sortField]: sortOrder } });
  };
  useEffect(() => {
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!data) {
      setDataListing({ ...dataListing, isError, isLoading });

      return;
    }
    const {
      meta: { page, limit, total },
      result
    } = data;

    setDataListing({
      ...dataListing,
      isError,
      isLoading,
      limit,
      page,
      rows: result,
      total
    });
  }, [data]);

  return {
    changeLimit,
    changePage,
    dataListing: !dataListing?.rows
      ? (dataListing as DataListing)
      : ({
          ...dataListing,
          limit: currentFilter?.limit,
          page: currentFilter?.page
        } as DataListing),
    onSort,
    refetch,
    sortField: Object.keys(currentFilter?.sort)[0] as Fields,
    sortOrder: Object.values(currentFilter?.sort)[0] as SortOrder
  };
};
