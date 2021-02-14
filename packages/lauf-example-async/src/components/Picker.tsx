import React, { ChangeEvent } from "react";

type PickerProps<S extends string> = {
  selectedOption: S;
  options: S[];
  handleChange: (picked: S) => any;
};

export const Picker = <S extends string>({
  selectedOption,
  options,
  handleChange,
}: PickerProps<S>) => {
  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    handleChange(event.target.value as S);
    return true;
  };
  return (
    <span>
      <h1>{selectedOption}</h1>
      <select onChange={onChange}>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </span>
  );
};
