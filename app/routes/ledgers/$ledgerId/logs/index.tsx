import * as React from 'react';

import type { MetaFunction } from '@remix-run/node';
import { Session } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunction } from '@remix-run/server-runtime';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import invariant from 'tiny-invariant';

import { ObjectOf, Page, SectionWrapper } from '@numaryhq/storybook';

import { ledgers } from '~/src/components/Layout/routes';
import ComponentErrorBoundary from '~/src/components/Wrappers/ComponentErrorBoundary';
import IconTitlePage from '~/src/components/Wrappers/IconTitlePage';
import LedgerLogList from '~/src/components/Wrappers/Lists/LedgerLogList';
import { Cursor } from '~/src/types/generic';
import { LedgerLog, Transaction } from '~/src/types/ledger';
import { API_LEDGER } from '~/src/utils/api';
import { createApiClient } from '~/src/utils/api.server';
import { handleResponse, withSession } from '~/src/utils/auth.server';
import { QueryContexts, sanitizeQuery } from '~/src/utils/search';

export const meta: MetaFunction = () => ({
  title: 'Ledger logs',
  description: 'List',
});

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ComponentErrorBoundary
      id="ledger-logs"
      title="pages.ledger.logs.title"
      error={error}
      showAction={false}
    />
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  async function handleData(session: Session) {
    invariant(params.ledgerId, 'Expected params.ledgerId');
    const api = await createApiClient(session);
    const query = sanitizeQuery(request, QueryContexts.PARAMS);
    const url = `${API_LEDGER}/${params.ledgerId}/logs?${query}`;
    const logs = await api.getResource<
      Cursor<LedgerLog<Transaction | ObjectOf<any>>>
    >(url, 'cursor');

    if (logs) {
      return logs;
    }

    return null;
  }

  return handleResponse(await withSession(request, handleData));
};

export default function Index() {
  const { t } = useTranslation();
  const logs = useLoaderData<
    Cursor<LedgerLog<Transaction | ObjectOf<any>>>
  >() as unknown as Cursor<LedgerLog<Transaction | ObjectOf<any>>>;
  const { ledgerId: id } = useParams<{
    ledgerId: string;
  }>();

  return (
    <Page
      id="ledgerLogs"
      title={<IconTitlePage icon={ledgers.icon} title={id!} />}
    >
      <SectionWrapper title={t('pages.ledger.logs.title')}>
        <LedgerLogList logs={logs} />
      </SectionWrapper>
    </Page>
  );
}
