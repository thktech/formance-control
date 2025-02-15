import React, { FunctionComponent } from 'react';

import { Box, Typography } from '@mui/material';
import { get } from 'lodash';
import { boolean, string } from 'yup/lib/locale';

import { ProviderPictureProps } from './types';

import { lowerCaseAllWordsExceptFirstLetter } from '~/src/utils/format';
import { providersMap } from '~/src/utils/providersMap';

const ProviderPicture: FunctionComponent<ProviderPictureProps> = ({
  provider,
  text,
}) => {
  const logoAttr = get(
    providersMap,
    provider.toLowerCase(),
    providersMap.default
  );

  if (text === undefined) text = true;

  return (
    <Box component="span" display="flex" alignItems="center">
      <Box
        component="span"
        sx={{
          border: ({ palette }) => `1px solid ${palette.neutral[300]}`,
          borderRadius: '6px',
          p: '5px 5px 0px 5px',
        }}
      >
        {logoAttr && <img src={logoAttr.path} alt={provider} />}
      </Box>
      {text && (
        <Typography ml={1}>
          {lowerCaseAllWordsExceptFirstLetter(provider)}
        </Typography>
      )}
    </Box>
  );
};

export default ProviderPicture;
