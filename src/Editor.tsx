import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import "./Editor.scss";

interface Props {
  value: string;
  setValue: (value: string) => void;
}

export function Editor({ value, setValue }: Props) {
  const editorNode = useRef(document.createElement("div"));
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | undefined>();

  useEffect(() => {
    editorRef.current = monaco.editor.create(editorNode.current, {
      language: "json",
      value
    });

    editorRef.current.onDidChangeModelContent(() => {
      setValue(editorRef.current!.getValue());
    });
  }, []);

  useEffect(() => {
    if (editorRef.current!.getValue() != value) {
      editorRef.current!.setValue(value);
    }
  }, [value]);

  return (
    <div className="Editor">
      <div className="Editor__inner" ref={editorNode} />
    </div>
  );
}
