import { useState } from "react";
import cx from 'clsx';
import { Table, TextInput, Button, ScrollArea } from "@mantine/core";
import classes from './TableScrollArea.module.css';

const ReviewerTable = ({ reviewers, handleUpdateReviewers }) => {

  const [scrolled, setScrolled] = useState(false);

  const handleCellChange = (index, field, value) => {
    const newData = [...reviewers];
    newData[index][field] = value;
    handleUpdateReviewers(newData);
  };

  const handleRemoveReviewer = (index) => {
    const updatedReviewers = reviewers.filter((_, i) => i !== index);
    handleUpdateReviewers(updatedReviewers);
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
            <Table.Th>レビュアーID</Table.Th>
            <Table.Th>レビュアー名</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reviewers.map((reviewer, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <TextInput
                  value={reviewer.id}
                  onChange={(e) => handleCellChange(index, "id", e.target.value)}
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  value={reviewer.name}
                  onChange={(e) => handleCellChange(index, "name", e.target.value)}
                />
              </Table.Td>
              <Table.Td style={{ textAlign: "center" }}>
                <Button color="green" onClick={() => handleRemoveReviewer(index)}>
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

export default ReviewerTable;
