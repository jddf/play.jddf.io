import React, { useEffect, useState } from "react";
import TopAppBar, {
  TopAppBarFixedAdjust,
  TopAppBarIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle
} from "@material/react-top-app-bar";
import MaterialIcon from "@material/react-material-icon";
import { Cell, Grid, Row } from "@material/react-layout-grid";
import { Headline6 } from "@material/react-typography";
import { Editor } from "./Editor";
import { Validator, compileSchema } from "@jddf/jddf";
import "./PlayApp.scss";
import { ValidationError } from "@jddf/jddf/lib/Validator";

const INITIAL_SCHEMA = `{
  "properties": {
    "id": { "type": "string" },
    "createdAt": { "type": "timestamp" },
    "favoriteNumbers": {
      "elements": { "type": "uint32" }
    }
  },
  "optionalProperties": {
    "deletedAt": { "type": "timestamp" }
  }
}`;

const INITIAL_INSTANCE = `{
  "id": "bob",
  "favoriteNumbers": [3.14, 42, "100", 100],
  "deletedAt": "not a timestamp",
  "unexpected property": "foo"
}`;

export function PlayApp() {
  const [schema, setSchema] = useState(INITIAL_SCHEMA);
  const [instance, setInstance] = useState(INITIAL_INSTANCE);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    try {
      const validator = new Validator();
      setErrors(
        validator.validate(
          compileSchema(JSON.parse(schema)),
          JSON.parse(instance)
        )
      );
    } catch {}
  }, [schema, instance]);

  return (
    <div className="PlayApp">
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection align="start">
            <TopAppBarIcon navIcon tabIndex={0}>
              <MaterialIcon hasRipple icon="check" />
            </TopAppBarIcon>
            <TopAppBarTitle>JDDF Playground</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection align="end" role="toolbar"></TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust>
        <Grid>
          <Row>
            <Cell columns={6}>
              <Headline6 className="PlayApp__Headline">Schema</Headline6>
              <Editor value={schema} setValue={setSchema} />
            </Cell>
            <Cell columns={6}>
              <Headline6 className="PlayApp__Headline">Input</Headline6>
              <Editor value={instance} setValue={setInstance} />
            </Cell>
          </Row>
          <Row className="PlayApp__SecondRow">
            <Cell columns={12}>
              <Headline6 className="PlayApp__Headline">Errors</Headline6>
              <ErrorTable errors={errors} />
            </Cell>
          </Row>
        </Grid>
      </TopAppBarFixedAdjust>
    </div>
  );
}

function ErrorTable({ errors }: { errors: ValidationError[] }) {
  return (
    <div className="PlayApp__ErrorTable mdc-data-table">
      <table className="mdc-data-table__table">
        <thead>
          <tr className="mdc-data-table__header-row">
            <th className="mdc-data-table__header-cell">Schema Path</th>
            <th className="mdc-data-table__header-cell">Input Path</th>
          </tr>
        </thead>
        <tbody className="mdc-data-table__content">
          {errors.length === 0 ? (
            <tr className="mdc-data-table__row">
              <td className="mdc-data-table__cell">
                <i>No errors. The input is valid against the schema.</i>
              </td>
            </tr>
          ) : (
            errors.map((error, index) => <ErrorRow error={error} key={index} />)
          )}
        </tbody>
      </table>
    </div>
  );
}

function ErrorRow({ error }: { error: ValidationError }) {
  return (
    <tr className="mdc-data-table__row">
      <td className="mdc-data-table__cell">
        <ErrorPath path={error.schemaPath} />
      </td>

      <td className="mdc-data-table__cell">
        <ErrorPath path={error.instancePath} />
      </td>
    </tr>
  );
}

function ErrorPath({ path }: { path: string[] }) {
  if (path.length === 0) {
    return <i>Top-level (root)</i>;
  }

  const [first, ...rest] = path.map(token => <ErrorToken token={token} />);
  return (
    <>
      {first}
      {rest.map(token => (
        <> / {token}</>
      ))}
    </>
  );
}

function ErrorToken({ token }: { token: string }) {
  return <code className="PlayApp__ErrorToken">{token}</code>;
}
