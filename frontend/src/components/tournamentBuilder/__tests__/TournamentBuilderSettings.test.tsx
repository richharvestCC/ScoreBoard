import React from 'react';
import { render } from '@testing-library/react';
import TournamentBuilder from '../TournamentBuilder';

describe('TournamentBuilder', () => {
  it('renders without crashing', () => {
    expect(() => render(<TournamentBuilder />)).not.toThrow();
  });
});
