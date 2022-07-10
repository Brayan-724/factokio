import { Box, type BoxProps } from "@chakra-ui/react";

function UIElement(props: BoxProps): JSX.Element {
  const { children, ...rest } = props;

  return <Box pos="fixed" {...rest}>{children}</Box>;
}

export default UIElement;