import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';

import { Typography } from '@mui/material';

import { LineChart, useGraphQuery } from '@centreon/ui';

import { ServiceMetric } from './models';
import { labelNoDataFound } from './translatedLabels';
import { useNoDataFoundStyles } from './NoDataFound.styles';
import { graphEndpoint } from './api/endpoints';

interface Props {
  metrics: Array<ServiceMetric>;
}

const WidgetLineChart = ({ metrics }: Props): JSX.Element => {
  const { classes } = useNoDataFoundStyles();
  const { t } = useTranslation();
  const { graphData, start, end, isGraphLoading, isMetricIdsEmpty } =
    useGraphQuery({
      baseEndpoint: graphEndpoint,
      metrics
    });

  if (isNil(graphData) && (!isGraphLoading || isMetricIdsEmpty)) {
    return (
      <Typography className={classes.noDataFound} variant="h5">
        {t(labelNoDataFound)}
      </Typography>
    );
  }

  return (
    <LineChart
      data={graphData}
      end={end}
      height={null}
      legend={{ display: true }}
      loading={isGraphLoading}
      start={start}
      timeShiftZones={{
        enable: false
      }}
      zoomPreview={{
        enable: false
      }}
    />
  );
};

export default WidgetLineChart;
