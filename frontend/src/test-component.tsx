import React from 'react';

// TODO: Remove this test component
export const TestComponent: React.FC = () => {
  const [count, setCount] = useState(0); // Missing import
  
  return (
    <div onClick={() => setCount(count + 1)}>
      Count: {count}
    </div>
  );
};
