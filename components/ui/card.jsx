import React from 'react';
import { Card as SemanticCard } from 'semantic-ui-react';

export default function Card({ children, ...props }) {
  return <SemanticCard {...props}>{children}</SemanticCard>;
}
