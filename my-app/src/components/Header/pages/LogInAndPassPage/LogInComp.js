import React from "react";
import { Input } from "@chakra-ui/react";

function LogInComp(props) {
  const handleChange = (event) => {
    if (event.target.value !== undefined) {
      props.onChange(event.target.value);
    }
  };

  return (
    <Input
      value={props.login}
      onChange={handleChange}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      placeholder="Login"
      size="md"
      className={props.isFocused ? "focused" : ""}
    />
  );
}

export default LogInComp;