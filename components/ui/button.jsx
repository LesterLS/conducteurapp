import React from 'react';
import { Button as SemanticButton } from 'semantic-ui-react';

export default function Button({ children, ...props }) {
  return <SemanticButton {...props}>{children}</SemanticButton>;
}
