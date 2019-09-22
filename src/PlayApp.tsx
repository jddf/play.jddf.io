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
import { Snackbar } from "@material/react-snackbar";
import { Editor } from "./Editor";
import { Validator, compileSchema } from "@jddf/jddf";
import "./PlayApp.scss";
import { ValidationError } from "@jddf/jddf/lib/Validator";
import axios from "axios";
import { RouteComponentProps, navigate } from "@reach/router";

const SHORT_URL_SERVICE =
  "https://us-central1-jddf-1569094432055.cloudfunctions.net/function-1";

interface ShortURLServiceGetResponse {
  schema: string;
  instance: string;
}

interface ShortURLServicePostResponse {
  id: string;
}

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

interface Props {
  shareId?: string;
}

export function PlayApp({ shareId }: Props & RouteComponentProps) {
  const [schema, setSchema] = useState(INITIAL_SCHEMA);
  const [instance, setInstance] = useState(INITIAL_INSTANCE);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [sharedIDs, setSharedIDs] = useState<string[]>([]);

  useEffect(() => {
    // On mount, attempt to pull down based on a shared URL, if there is one.
    const fetchShare = async () => {
      if (shareId !== undefined) {
        const {
          data: { schema, instance }
        } = await axios.get<ShortURLServiceGetResponse>(SHORT_URL_SERVICE, {
          params: { id: shareId }
        });

        setSchema(schema);
        setInstance(instance);
      }
    };

    fetchShare();
  }, [shareId]);

  const createShareURL = async () => {
    // Create a share-able URL using the backend, and redirect to it
    // immediately.
    const {
      data: { id }
    } = await axios.post<ShortURLServicePostResponse>(SHORT_URL_SERVICE, {
      schema,
      instance
    });

    setSharedIDs([...sharedIDs, id]);
    navigate(`/p/${id}`);
  };

  useEffect(() => {
    // Recompute validation errors whenever the schema or instance changes.
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
          <TopAppBarSection align="end" role="toolbar">
            <TopAppBarIcon actionItem>
              <MaterialIcon icon="share" onClick={createShareURL} />
            </TopAppBarIcon>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <TopAppBarFixedAdjust>
        {sharedIDs.map(id => (
          <Snackbar
            key={id}
            message="You've been redirected to a URL you can share."
            actionText="dismiss"
          />
        ))}
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
      {rest.map((token, index) => (
        <span key={index}> / {token}</span>
      ))}
    </>
  );
}

function ErrorToken({ token }: { token: string }) {
  return <code className="PlayApp__ErrorToken">{token}</code>;
}
