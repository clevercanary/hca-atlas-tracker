import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  NewAtlasData,
  newAtlasSchema,
} from "../../app/apis/catalog/hca-atlas-tracker/common/schema";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      pageTitle: "Add New Atlas",
    },
  };
};

const CreateAtlasPage = (): JSX.Element => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(newAtlasSchema),
  });

  const { token } = useAuthentication();
  const router = useRouter();

  const [submitDisabled, setSubmitDisabled] = useState(false);

  const onSubmit = useCallback(
    async (data: NewAtlasData): Promise<void> => {
      setSubmitDisabled(true);
      const res = await fetch("/api/atlases/create", {
        body: JSON.stringify(data),
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        method: "POST",
      });
      if (res.status !== 201) {
        setSubmitDisabled(false);
        // TODO more useful error handling
        throw new Error(
          await res
            .json()
            .then(({ message }) => message)
            .catch(() => `Received ${res.status} response`)
        );
      }
      const { id } = await res.json();
      router.push(`/atlases/edit/${id}`);
    },
    [token, setSubmitDisabled, router]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="network"
        control={control}
        defaultValue=""
        render={({ field }): JSX.Element => (
          <TextField
            {...field}
            label="Network"
            error={!!errors.network}
            helperText={errors.network?.message}
          />
        )}
      />
      <Controller
        name="version"
        control={control}
        defaultValue=""
        render={({ field }): JSX.Element => (
          <TextField
            {...field}
            label="Version"
            error={!!errors.version}
            helperText={errors.version?.message}
          />
        )}
      />
      <Controller
        name="focus"
        control={control}
        defaultValue=""
        render={({ field }): JSX.Element => (
          <TextField
            {...field}
            label="Focus"
            error={!!errors.focus}
            helperText={errors.focus?.message}
          />
        )}
      />
      <Button type="submit" disabled={submitDisabled}>
        Save
      </Button>
    </form>
  );
};

export default CreateAtlasPage;
