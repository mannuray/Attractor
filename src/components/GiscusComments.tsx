import React from "react";
import Giscus from "@giscus/react";
import styled from "styled-components";

const GiscusContainer = styled.div`
  width: 100%;
  margin-top: 16px;

  /* Ensure Giscus iframe fits well */
  .giscus {
    width: 100%;
  }

  .giscus-frame {
    border: none;
    width: 100%;
  }
`;

export const GiscusComments: React.FC = () => {
  return (
    <GiscusContainer>
      <Giscus
        id="chaos-iterator-comments"
        repo="mannuray/Attractor"
        repoId="R_kgDOLHlD8w"
        category="Feedback"
        categoryId="DIC_kwDOLHlD884C0m94"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="dark"
        lang="en"
        loading="lazy"
      />
    </GiscusContainer>
  );
};

export default GiscusComments;
