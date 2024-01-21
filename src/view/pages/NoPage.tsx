import React from "react";
import styled from "styled-components";

function NoPage(props) {
  return (
    <>
      <Text1>I Don&#39;t have what you are looking for</Text1>
      <Text2>404</Text2>
    </>
  );
}

const Text1 = styled.span`
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
  color: #121212;
  font-size: 40px;
  margin-top: 183px;
  margin-left: 359px;
  text-align: center;
  align-self: center;
`;

const Text2 = styled.span`
  font-family: Roboto;
  font-style: normal;
  font-weight: 700;
  color: #121212;
  font-size: 200px;
  margin-top: 37px;
  margin-left: 511px;
  text-align: center;
  align-self: center;
`;

export default NoPage;
