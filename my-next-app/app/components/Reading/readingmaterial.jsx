import React from 'react';
import "../../reading/styles.css";

export default function ReadingMaterial(props) {
  return (
    <div>
      <div className="reading-material text-foreground bg-background" dangerouslySetInnerHTML={{__html: props.material}}></div>
    </div>
  );
};