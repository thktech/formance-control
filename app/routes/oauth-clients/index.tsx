import * as React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Add, ArrowRight } from '@mui/icons-material';
import { Box } from '@mui/material';
import type { MetaFunction } from '@remix-run/node';
import { Session } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/server-runtime';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import { LoadingButton, Row, TextArea, TextField } from '@numaryhq/storybook';

import { getRoute, OAUTH_CLIENT_ROUTE } from '~/src/components/Layout/routes';
import Modal from '~/src/components/Wrappers/Modal';
import Table from '~/src/components/Wrappers/Table';
import { useService } from '~/src/hooks/useService';
import i18n from '~/src/translations';
import { OAuthClient, OAuthSecret } from '~/src/types/oauthClient';
import { API_AUTH, ApiClient } from '~/src/utils/api';
import { createApiClient } from '~/src/utils/api.server';
import { handleResponse, withSession } from '~/src/utils/auth.server';

export const meta: MetaFunction = () => ({
  title: 'OAuth clients',
  description: 'List',
});

export type CreateOAuthClient = {
  name: string;
  description?: string;
};

export const schema = yup.object({
  name: yup
    .string()
    .required(i18n.t('pages.oAuthClients.form.create.name.errors.required')),
});

export const submit = async (
  values: CreateOAuthClient,
  api: ApiClient
): Promise<boolean | undefined | { secret: string; clientId: string }> => {
  const client = await api.postResource<OAuthClient>(
    `${API_AUTH}/clients`,
    values,
    'data'
  );

  if (client && client.id) {
    const secret = await api.postResource<OAuthSecret>(
      `${API_AUTH}/clients/${client.id}/secrets`,
      {},
      'data'
    );
    if (secret && secret.clear) {
      return { secret: secret.clear, clientId: client.id };
    }
  }

  return false;
};

export const loader: LoaderFunction = async ({ request }) => {
  async function handleData(session: Session) {
    const oauthClients = await (
      await createApiClient(session)
    ).getResource<OAuthClient[]>(`${API_AUTH}/clients`, 'data');

    if (oauthClients) {
      return oauthClients;
    }

    return null;
  }

  return handleResponse(await withSession(request, handleData));
};

export default function Index() {
  const { t } = useTranslation();
  const oauthClients = useLoaderData();
  const navigate = useNavigate();
  const { api } = useService();
  const {
    getValues,
    formState: { errors },
    control,
    trigger,
    reset,
  } = useForm<CreateOAuthClient>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
  });

  const onSave = async () => {
    const validated = await trigger('name');
    if (validated) {
      const result = await submit(getValues(), api);
      if (
        result &&
        typeof result === 'object' &&
        result.secret &&
        result.clientId
      ) {
        navigate(getRoute(OAUTH_CLIENT_ROUTE, result.clientId), {
          state: { secret: result.secret },
        });
      }
    }
  };

  const renderRowActions = (oauthClient: OAuthClient) => (
    <Box component="span" key={oauthClient.id}>
      <LoadingButton
        id={`show-${oauthClient.id}`}
        onClick={() => navigate(getRoute(OAUTH_CLIENT_ROUTE, oauthClient.id))}
        endIcon={<ArrowRight />}
      />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Modal
          button={{
            id: 'create',
            variant: 'dark',
            endIcon: <Add />,
          }}
          modal={{
            PaperProps: { sx: { minWidth: '500px' } },
            title: t('common.dialog.createTitle'),
            actions: {
              cancel: {
                onClick: async () => {
                  reset();
                },
              },
              save: {
                onClick: onSave,
                disabled: !!errors.name,
              },
            },
          }}
        >
          <form>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  error={!!errors.name}
                  errorMessage={errors.name?.message}
                  label={t('pages.oAuthClients.form.create.name.label')}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  aria-label="text-area"
                  minRows={10}
                  placeholder={t(
                    'pages.oAuthClients.form.create.description.placeholder'
                  )}
                />
              )}
            />
          </form>
        </Modal>
      </Box>
      <Table
        id="oauth-clients-list"
        items={oauthClients}
        action={true}
        withPagination={false}
        columns={[
          {
            key: 'name',
            label: t('pages.oAuthClients.table.columnLabel.name'),
          },
          {
            key: 'public',
            label: t('pages.oAuthClients.table.columnLabel.public'),
          },
        ]}
        renderItem={(oAuthClient: OAuthClient, index: number) => (
          <Row
            key={index}
            keys={['name', 'public']}
            item={oAuthClient}
            renderActions={() => renderRowActions(oAuthClient)}
          />
        )}
      />
    </Box>
  );
}
