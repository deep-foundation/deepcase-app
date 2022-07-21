import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useState } from "react";
import { useDeepGraph, useSelectedLinksMethods } from "../pages";
import { useBaseTypes, useScreenFind } from "./hooks";
import levenSort from 'leven-sort';

export function ScreenFind({
  ml
}: {
  ml: any;
}): JSX.Element {
  const [screenFind, setScreenFind] = useScreenFind();
  const { focusLink } = useDeepGraph();
  const selectiedMethods = useSelectedLinksMethods();
  const deep = useDeep();
  const [baseTypes] = useBaseTypes();

  const [founded, setFounded] = useState([]);

  return <Autocomplete
    value={screenFind}
    options={founded}
    renderOption={(id) => {
      const type = deep.stringify(ml?.byId[id]?.type?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value);
      const name = deep.stringify(ml?.byId[id]?.inByType[baseTypes.Contain]?.[0]?.value?.value);
      return <div>
        <Typography>{ml.byId?.[id]?.id} {!!name && <Typography variant="caption" color="primary">{name}</Typography>}</Typography>
        <Typography component="div" variant="caption" color="primary">{type}</Typography>
        {!!ml?.byId[id]?.value?.value && <Typography component="div" variant="caption" style={{}}>{((s) => (s.length > 30 ? `${s.slice(0, 30).trim()}...` : s))(deep.stringify(ml?.byId[id]?.value?.value))}</Typography>}
      </div>;
    }}
    getOptionLabel={(id) => id}
    style={{ width: 200 }}
    onChange={(event, newValue) => {
      if (newValue) {
        focusLink(+newValue);
        selectiedMethods.add(0, +newValue);
        selectiedMethods.scrollTo(0, +newValue);
      }
    }}
    filterOptions={options => options}
    renderInput={(params) => <TextField {...params}
      label="find"
      margin="normal"
      variant="outlined"
      size="small"
      style={{ margin: 0 }}
      onChange={(event) => {
        const newValue = event?.target?.value;
        const results = ml.links.map(link => ({ link, value: `${link.id} ${deep.stringify(link.inByType[baseTypes.Contain]?.[0]?.value?.value)} ${deep.stringify(link?.value?.value)}`.toLowerCase() }));
        setFounded(levenSort(results, newValue.toLowerCase(), 'value').map(({ link }) => `${link.id}`));
        // const results = [
        //   ...ml.links.filter(link => link?.id.toString().co).map(link => `${link.id}`),
        //   ...ml.links.filter(link => link?.value?.value.toString().includes(newValue)).map(link => `${link.id}`),
        // ];
      }}
    />}
  />
}