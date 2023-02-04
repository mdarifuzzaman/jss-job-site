import {
  withDatasourceCheck,
  constants,
  GraphQLRequestClient,
} from '@sitecore-jss/sitecore-jss-nextjs';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import config from 'temp/config';

const JobDetails = (): JSX.Element => {
  const [data, setData] = useState({ search: { results: [] } });
  useEffect(() => {
    getData();
    async function getData() {
      const d = await getSearchData();
      setData(d);
      const job = data?.search?.results;
      console.log('specific - job ', job);
    }
  }, []);
  return (
    <div>
      <Script
        id="moosend_track"
        dangerouslySetInnerHTML={{ __html: `mootrack('Pageview: Job Details with ID: Test Page')` }}
      ></Script>
      <p>JobDetails Component</p>
      {/* <Text field={props.fields.heading} /> */}
      {JSON.stringify(data)}
    </div>
  );
};

const getSearchData = async () => {
  console.log('Inside server side props..');
  if (process.env.JSS_MODE === constants.JSS_MODE.DISCONNECTED) {
    return null;
  }

  const graphQLClient = new GraphQLRequestClient(config.graphQLEndpoint, {
    apiKey: '{4672EB7C-E577-43CC-8B6C-EA04611866A8}',
  });

  const query = `query {
    search(where: {
      AND: [
          {
            name: "_templates"
            value: "15E850DB-1D8A-46C9-B9FD-04AA808BBC51"
            operator: CONTAINS
          },
          {
            name: "_path",
            value: "${new URLSearchParams(window.location.search).get('jobId')}",
            operator: EQ
          },
          {
            name: "_language",
            value: "en",
            operator: EQ
          }
        ]
      }, 
      first: 5
      orderBy: { name: "_name", direction: ASC }
      )
    {
      results {
        displayName,
        id,
        fields {
          id,
          name,
          definition {
            name
          },
          jsonValue
        }
      }
    }
  }`;

  const result = await graphQLClient.request<any>(query);
  console.log('Job details result', result);
  return result;
};

export default withDatasourceCheck()(JobDetails);
