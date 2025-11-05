import {Spinner, Spacer} from "@nextui-org/react";
const LoadingPage = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
        <Spinner size = "lg" label = "Loading exam..."/>
    </div>
  );
}

export default LoadingPage;