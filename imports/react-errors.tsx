import React from 'react';

export class CatchErrors extends React.Component<{
  errorRenderer?: (error: Error, reset: () => any) => React.ReactNode;
  children: any;
},any> {
  reset: () => any;

  constructor(props) {
    super(props);
    this.state = { error: undefined };

    this.reset = () => {
      this.setState({ error: undefined });
    };
  }

  static getDerivedStateFromError(error) {
    console.log('getDerivedStateFromError', error);
    return { error };
  }
  componentDidCatch(error, errorInfo) {
    console.log('componentDidCatch', error, errorInfo);
  }

  errorRenderer = (error, reset) => <></>;

  render() {
    if (this.state.error) {
      return this?.props?.errorRenderer ? this?.props?.errorRenderer(this.state.error, this.reset) : this?.errorRenderer(this.state.error, this.reset);
    }

    return this.props.children; 
  }
}