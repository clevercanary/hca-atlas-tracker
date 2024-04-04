import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, TextField } from "@mui/material";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  NewSourceDatasetData,
  newSourceDatasetSchema,
} from "../../../../app/apis/catalog/hca-atlas-tracker/common/schema";

interface CreatePageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface CreatePageProps {
  atlasId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { atlasId } = context.params as CreatePageUrlParams;
  return {
    props: {
      atlasId,
      pageTitle: "Add New Source Dataset",
    },
  };
};

const CreateAtlasPage = ({ atlasId }: CreatePageProps): JSX.Element => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(newSourceDatasetSchema),
  });

  const { token } = useAuthentication();
  const router = useRouter();

  const [submitDisabled, setSubmitDisabled] = useState(false);

  const onSubmit = useCallback(
    async (data: NewSourceDatasetData): Promise<void> => {
      setSubmitDisabled(true);
      const res = await fetch(
        `/api/atlases/${atlasId}/source-datasets/create`,
        {
          body: JSON.stringify(data),
          headers: {
            "content-type": "application/json",
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
          method: "POST",
        }
      );
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
      router.push(`/atlases/${atlasId}/source-datasets/${id}/edit`);
    },
    [atlasId, token, setSubmitDisabled, router]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="doi"
        control={control}
        defaultValue=""
        render={({ field }): JSX.Element => (
          <TextField
            {...field}
            label="DOI"
            error={!!errors.doi}
            helperText={errors.doi?.message}
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
