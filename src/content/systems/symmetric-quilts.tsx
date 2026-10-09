import React from "react";
import { BlockMath } from "react-katex";
import { AttractorCard, AttractorName, GridImage, ImageGrid, ImageLabel, MathBlock, Paragraph, ParamBadge, ParamList, SubTitle } from "../docPrimitives";

// Symmetric Quilts — moved verbatim from the Help & About page.
export default function SymmetricQuilts() {
  return (
    <>
      <AttractorCard>
        <AttractorName>Symmetric Quilts</AttractorName>
        <Paragraph>
          Also from Field and Golubitsky's "Symmetry in Chaos", quilts extend the icon
          concept by adding translational periodicity. While icons have point symmetry
          (rotations around a single point), quilts have <strong>wallpaper symmetry</strong>—they
          tile the plane infinitely like decorative wallpaper or Islamic geometric art.
        </Paragraph>
        <ImageGrid>
          <div><GridImage src="/gallery/symmetric-quilt-mosque.png" alt="Mosque" /><ImageLabel>Mosque</ImageLabel></div>
          <div><GridImage src="/gallery/symmetric-quilt-flowers.png" alt="Flowers with Ribbons" /><ImageLabel>Flowers with Ribbons</ImageLabel></div>
        </ImageGrid>
        <SubTitle>Wallpaper Groups</SubTitle>
        <Paragraph>
          Mathematicians have proven there are exactly 17 distinct wallpaper symmetry groups—
          the only ways to tile a plane with repeating symmetric patterns. Quilts can exhibit
          several of these groups, combining rotational symmetry with one or two directions
          of translational repetition.
        </Paragraph>
        <MathBlock>
          <BlockMath math="F(z) = (\lambda + \alpha z\bar{z} + \beta \text{Re}(z^n))z + \gamma\bar{z}^{n-1}" />
        </MathBlock>
        <Paragraph>
          The equation is similar to symmetric icons but with constraints that enforce
          periodic tiling. The chaotic trajectories fill in cells that repeat infinitely,
          creating mesmerizing patterns reminiscent of medieval tapestries or mosque
          tile work.
        </Paragraph>
        <ParamList>
          <ParamBadge>lambda</ParamBadge>
          <ParamBadge>alpha</ParamBadge>
          <ParamBadge>beta</ParamBadge>
          <ParamBadge>gamma</ParamBadge>
          <ParamBadge>degree</ParamBadge>
        </ParamList>
      </AttractorCard>
    </>
  );
}
