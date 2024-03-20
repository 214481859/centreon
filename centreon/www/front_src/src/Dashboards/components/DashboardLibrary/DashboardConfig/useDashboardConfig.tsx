import { useEffect } from 'react';

import { atom, useAtom, useSetAtom } from 'jotai';
import {
  createSearchParams,
  generatePath,
  useNavigate
} from 'react-router-dom';
import { equals } from 'ramda';

import { useSnackbar } from '@centreon/ui';

import { Dashboard, isDashboard } from '../../../api/models';
import { useCreateDashboard } from '../../../api/useCreateDashboard';
import routeMap from '../../../../reactRoutes/routeMap';
import { useUpdateDashboard } from '../../../api/useUpdateDashboard';
import { labelDashboardUpdated } from '../../../translatedLabels';
import { resetDashboardDerivedAtom } from '../../../SingleInstancePage/Dashboard/atoms';
import { DashboardLayout } from '../../../models';

const dialogStateAtom = atom<{
  dashboard: Dashboard | null;
  isOpen: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
  variant: 'create' | 'update';
}>({
  dashboard: null,
  isOpen: false,
  status: 'idle',
  variant: 'create'
});

type UseDashboardConfig = {
  closeDialog: () => void;
  createDashboard: () => void;
  dashboard: Dashboard | null;
  editDashboard: (dashboard: Dashboard) => () => void;
  isDialogOpen: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
  submit: (dashboard: Dashboard) => void;
  variant: 'create' | 'update';
};

const useDashboardConfig = (): UseDashboardConfig => {
  const [dialogState, setDialogState] = useAtom(dialogStateAtom);

  const resetDashboard = useSetAtom(resetDashboardDerivedAtom);

  const {
    mutate: createDashboardMutation,
    reset: resetCreateMutation,
    status: statusCreateMutation
  } = useCreateDashboard({});

  const {
    mutate: updateDashboardMutation,
    reset: resetUpdateMutation,
    status: statusUpdateMutation
  } = useUpdateDashboard();

  const { showSuccessMessage } = useSnackbar();

  const closeDialog = (): void =>
    setDialogState({ ...dialogState, isOpen: false });

  const createDashboard = (): void => {
    setDialogState({
      ...dialogState,
      dashboard: null,
      isOpen: true,
      variant: 'create'
    });
  };

  const editDashboard = (dashboard: Dashboard) => (): void => {
    setDialogState({
      ...dialogState,
      dashboard,
      isOpen: true,
      variant: 'update'
    });
  };

  const navigate = useNavigate();
  const navigateToDashboard = (dashboardId: string | number): void =>
    navigate({
      pathname: generatePath(routeMap.dashboard, {
        dashboardId,
        layout: DashboardLayout.Library
      }),
      search: createSearchParams({ edit: 'true' }).toString()
    });

  const submit = async (dashboard: Dashboard): Promise<void> => {
    setDialogState((currentDialogState) => ({
      ...currentDialogState,
      isOpen: false
    }));

    const data =
      dialogState.variant === 'create'
        ? await createDashboardMutation(dashboard)
        : await updateDashboardMutation(dashboard);

    if (equals(dialogState.variant, 'create')) {
      resetDashboard();
    }

    if (isDashboard(data) && dialogState.variant === 'create')
      navigateToDashboard(data.id);
  };

  const submitForm = (dashboard: Dashboard): void => {
    submit(dashboard).then(() => {
      showSuccessMessage(labelDashboardUpdated);
    });
  };

  useEffect(() => {
    setDialogState((currentDialogState) => ({
      ...currentDialogState,
      status: statusUpdateMutation
    }));

    if (statusCreateMutation === 'success') resetCreateMutation();
    if (statusUpdateMutation === 'success') resetUpdateMutation();
  }, [statusCreateMutation, statusUpdateMutation]);

  return {
    closeDialog,
    createDashboard,
    dashboard: dialogState.dashboard,
    editDashboard,
    isDialogOpen: dialogState.isOpen,
    status: dialogState.status,
    submit: submitForm,
    variant: dialogState.variant
  };
};

export { useDashboardConfig };
