import React, { FunctionComponent } from 'react';

import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { WaitEventStageProps } from './types';

import { Chip } from '@numaryhq/storybook';

import NodeTitle from '~/src/components/Wrappers/Workflows/CustomNode/NodeTitle';
import {
  chipContainer,
  containerSx,
} from '~/src/components/Wrappers/Workflows/stages/utils';

const WaitEventStage: FunctionComponent<WaitEventStageProps> = ({
  wait_event,
}) => {
  const { t } = useTranslation();

  return (
    <Box className=" react-flow__nodes">
      <Box className="react-flow__node-default">
        <NodeTitle label={t('pages.flow.waitEvent.title')} />
        <>
          <Box component="span" display="block" pl={1} sx={containerSx}>
            <Box sx={chipContainer}>
              <Typography sx={{ fontSize: '8px' }} variant="bold">
                {t('pages.flow.waitEvent.event')}
              </Typography>
              <Chip label={wait_event.event} variant="square" color="blue" />
            </Box>
          </Box>
        </>
      </Box>
    </Box>
  );
};

export default WaitEventStage;
