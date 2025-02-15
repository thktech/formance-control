import * as React from 'react';

import { LockOpenOutlined, LockOutlined } from '@mui/icons-material';
import { Box } from '@mui/material';
import type { MetaFunction } from '@remix-run/node';
import { Session } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/server-runtime';
import { useTranslation } from 'react-i18next';

import { Chip, Row } from '@numaryhq/storybook';

import { OAUTH_CLIENT_ROUTE } from '~/src/components/Layout/routes';
import ComponentErrorBoundary from '~/src/components/Wrappers/ComponentErrorBoundary';
import ShowListAction from '~/src/components/Wrappers/Lists/Actions/ShowListAction';
import Table from '~/src/components/Wrappers/Table';
import { OAuthClient } from '~/src/types/oauthClient';
import { API_AUTH } from '~/src/utils/api';
import { createApiClient } from '~/src/utils/api.server';
import { handleResponse, withSession } from '~/src/utils/auth.server';

export const meta: MetaFunction = () => ({
  title: 'OAuth clients',
  description: 'List',
});

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ComponentErrorBoundary
      id="oauth-clients"
      error={error}
      showAction={false}
    />
  );
}

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
  const oAuthClients = useLoaderData() as OAuthClient[];

  return (
    <Box mt={2}>
      <Table
        id="oauth-clients-list"
        items={oAuthClients}
        action
        withPagination={false}
        columns={[
          {
            key: 'name',
            label: t('pages.oAuthClients.table.columnLabel.name'),
            width: 20,
          },
          {
            key: 'public',
            label: t('pages.oAuthClients.table.columnLabel.public'),
            width: 10,
          },
          {
            key: 'description',
            label: t('pages.oAuthClients.table.columnLabel.description'),
            width: 70,
          },
        ]}
        renderItem={(oAuthClient: OAuthClient, index: number) => (
          <Row
            key={index}
            keys={[
              'name',
              <Chip
                key={index}
                icon={
                  !oAuthClient.public ? <LockOutlined /> : <LockOpenOutlined />
                }
                label={t(
                  `pages.oAuthClients.table.rows.${
                    oAuthClient.public ? 'public' : 'private'
                  }`
                )}
                variant="square"
                color="yellow"
              />,
              'description',
            ]}
            item={oAuthClient}
            renderActions={() => (
              <ShowListAction id={oAuthClient.id} route={OAUTH_CLIENT_ROUTE} />
            )}
          />
        )}
      />
    </Box>
  );
}
