import React from 'react';
import { Checkbox as SemanticCheckbox } from 'semantic-ui-react';

export default function Checkbox({ label, ...props }) {
  return <SemanticCheckbox label={label} {...props} />;
}
