import { Box } from '@chakra-ui/react';
import * as React from 'react';
import UIFps from './Fps';

export interface IGameUIProps {}

function GameUI(props: IGameUIProps) {
  return (
    <Box pos="fixed" w="100vw" h="100vh">
      <UIFps />
    </Box>
  );
}

export default GameUI;
