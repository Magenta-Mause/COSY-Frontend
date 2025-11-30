import { useCursorify } from "@cursorify/react";

const CustomCursor = () => {
  const { mouseState, style } = useCursorify();

  return <div style={{ width: 40, height: 40 }}>🖐️</div>;
};

export default CustomCursor;
