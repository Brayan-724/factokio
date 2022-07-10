import { Box, Flex, Text } from '@chakra-ui/react';
import type { TextProps } from '@chakra-ui/react';
import { useMemo } from 'react';
import WebGl from 'three/examples/jsm/capabilities/WebGL';
import Game from './react';

const supportsWebGl = WebGl.isWebGLAvailable();
const supportsWebGlMessage = WebGl.getWebGLErrorMessage();

function MessageText({ children, ...props }: TextProps) {
  return (
    <Text
      fontSize="3xl"
      fontWeight="bold"
      color="red.500"
      textAlign="center"
      bg="white"
      px="4"
      py="4"
      rounded="md"
      {...props}>
      {children}
    </Text>
  );
}

function App(): JSX.Element {
  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      gap="5"
      pos="fixed"
      w="100vw"
      h="100vh"
      bg="black"
      color="white">
      {supportsWebGl ? (
        <Game />
      ) : (
        <Box>
          <MessageText as="h1">WebGL is not supported</MessageText>
          <MessageText as="h2" fontSize="xl" mt="3" color="black">
            {supportsWebGlMessage.innerText}
          </MessageText>
        </Box>
      )}
    </Flex>
  );
}

export default App;
