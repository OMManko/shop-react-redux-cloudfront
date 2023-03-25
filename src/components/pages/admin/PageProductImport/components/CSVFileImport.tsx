import React from "react";
import axios, { AxiosError } from "axios";
import { Snackbar, Alert, Box, Typography } from "@mui/material";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [error, setError] = React.useState<string | null>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);

    if (!file) {
      return Promise.reject("File was not found");
    }

    const authorizationToken = localStorage.getItem("authorization_token");
    const headers = authorizationToken
      ? {
          Authorization: `Basic ${authorizationToken}`,
        }
      : undefined;

    let response;

    try {
      response = await axios({
        method: "GET",
        url,
        headers,
        params: {
          name: encodeURIComponent(file.name),
        },
      });
    } catch (e) {
      if (e instanceof AxiosError) {
        const status = e.response?.status;

        if (status === 401 || status === 403) {
          setError(
            `The request failed with ${status} status: ${e.response?.data?.message}`
          );
        }
      }
      return;
    }

    console.log("File to upload: ", file.name);
    console.log("Uploading to: ", response.data);

    const result = await fetch(response.data, {
      method: "PUT",
      body: file,
    });

    console.log("Result: ", result);

    setFile(undefined);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Snackbar open={!!error} autoHideDuration={2000}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
