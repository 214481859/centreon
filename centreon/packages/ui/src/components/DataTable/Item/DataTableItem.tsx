import React, { forwardRef, ReactElement, RefObject, useMemo } from 'react';

import {
  CardMedia,
  Card as MuiCard,
  CardActionArea as MuiCardActionArea,
  CardActions as MuiCardActions,
  CardContent as MuiCardContent,
  Typography as MuiTypography
} from '@mui/material';

import { useStyles } from './DataTableItem.styles';

export interface DataTableItemProps {
  Actions?: JSX.Element;
  description?: string;
  hasActions?: boolean;
  hasCardAction?: boolean;
  onClick?: () => void;
  thumbnail?: string;
  title: string;
}

const DataTableItem = forwardRef(
  (
    {
      title,
      description,
      hasCardAction = false,
      hasActions = false,
      onClick,
      Actions,
      thumbnail
    }: DataTableItemProps,
    ref
  ): ReactElement => {
    const { classes } = useStyles();

    const ActionArea = useMemo(
      () => (hasCardAction ? MuiCardActionArea : React.Fragment),
      [hasCardAction]
    );

    return (
      <MuiCard
        className={classes.dataTableItem}
        data-item-title={title}
        ref={ref as RefObject<HTMLDivElement>}
        variant="outlined"
      >
        <ActionArea aria-label="view" onClick={() => onClick?.()}>
          {thumbnail && (
            <img
              alt={`thumbnail-${title}`}
              className={classes.thumbnail}
              src={thumbnail}
            />
          )}
          <MuiCardContent className={classes.cardContent}>
            <MuiTypography fontWeight={500} variant="h5">
              {title}
            </MuiTypography>
            {description && (
              <MuiTypography className={classes.description}>
                {description}
              </MuiTypography>
            )}
          </MuiCardContent>
        </ActionArea>
        {hasActions && (
          <MuiCardActions className={classes.cardActions}>
            <span />
            <span>{Actions}</span>
          </MuiCardActions>
        )}
      </MuiCard>
    );
  }
);

export { DataTableItem };
