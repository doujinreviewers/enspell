import { useState } from "react";
import cx from 'clsx';
import { Table, TextInput, Button, ScrollArea } from "@mantine/core";
import classes from './TableScrollArea.module.css';

const CircleTable = ({ circles, handleUpdateCircles }) => {

  const [scrolled, setScrolled] = useState(false);

  const handleCellChange = (index, field, value) => {
    const newData = [...circles];
    newData[index][field] = value;
    handleUpdateCircles(newData);
  };

  const handleRemoveCircle = (index) => {
    const updatedCircles = circles.filter((_, i) => i !== index);
    handleUpdateCircles(updatedCircles);
  };

  return (
    <ScrollArea.Autosize mah={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table 
        highlightOnHover
        withTableBorder
        withColumnBorders
        stickyHeader
        stickyHeaderOffset={-1}
        style={{ width: "100%", maxWidth: "800px" }}
      >
        <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <Table.Tr>
            <Table.Th>サークルID</Table.Th>
            <Table.Th>サークル名</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {circles.map((circle, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <TextInput
                  value={circle.id}
                  onChange={(e) => handleCellChange(index, "id", e.target.value)}
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  value={circle.name}
                  onChange={(e) => handleCellChange(index, "name", e.target.value)}
                />
              </Table.Td>
              <Table.Td style={{ textAlign: "center" }}>
                <Button color="green" onClick={() => handleRemoveCircle(index)}>
                  ブロック解除
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea.Autosize>
  );
};

export default CircleTable;
