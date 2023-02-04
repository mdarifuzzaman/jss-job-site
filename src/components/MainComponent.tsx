import {
  Field,
  withDatasourceCheck,
  GetStaticComponentProps,
  constants,
  GraphQLRequestClient,
  useComponentProps,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { ComponentProps } from 'lib/component-props';
import config from 'temp/config';

type MainComponentProps = ComponentProps & {
  fields: {
    heading: Field<string>;
  };
};

const MainComponent = (props: MainComponentProps): JSX.Element => {
  const data = useComponentProps<any>(props.rendering.uid);

  const allJobs = data.search?.results;
  console.log('allJobs', allJobs);
  const recents = allJobs.filter(
    (a: any) => a.fields.find((f: any) => f.definition.name == 'IsRecent')?.jsonValue.value == true
  );
  const features = allJobs.filter(
    (a: any) => a.fields.find((f: any) => f.definition.name == 'IsFeature')?.jsonValue.value == true
  );

  return (
    <>
      <main>
        <section id="recent-jobs">
          <h2>Recent Jobs</h2>
          <div className="recent-jobs-container">
            {recents &&
              recents.map((rj: any) => (
                <div key={rj.displayName} className="recent-job-box">
                  {/* <img src="recent-job1.jpg" alt="recent-job1" /> */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: rj.fields.filter((field: any) => field.name === 'Title')[0].jsonValue
                        ?.value,
                    }}
                  ></div>
                  <p>
                    {
                      rj.fields.filter((field: any) => field.name === 'CompanyName')[0].jsonValue
                        ?.value
                    }
                  </p>
                  <p>
                    {
                      rj.fields.filter((field: any) => field.name === 'Location')[0].jsonValue
                        ?.value
                    }
                  </p>
                  <p>
                    {rj.fields.filter((field: any) => field.name === 'JobType')[0].jsonValue?.value}
                  </p>
                  <a href={'/job?jobId=' + rj.id} className="view-job-btn">
                    View Job
                  </a>
                </div>
              ))}
          </div>
        </section>
        <section id="featured-jobs">
          <h2>Featured Jobs</h2>
          <div className="featured-jobs-container">
            {features &&
              features.map((fj: any) => (
                <div key={fj.displayName} className="featured-job">
                  {/* <img src="job1.jpg" alt="job1" /> */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: fj.fields.filter((field: any) => field.name === 'Title')[0].jsonValue
                        ?.value,
                    }}
                  ></div>
                  <p>
                    {
                      fj.fields.filter((field: any) => field.name === 'CompanyName')[0].jsonValue
                        ?.value
                    }
                  </p>
                  <p>
                    {
                      fj.fields.filter((field: any) => field.name === 'Location')[0].jsonValue
                        ?.value
                    }
                  </p>
                  <p>
                    {fj.fields.filter((field: any) => field.name === 'JobType')[0].jsonValue?.value}
                  </p>
                  <a href={'/job?jobId=' + fj.id} className="view-job-btn">
                    View Job
                  </a>
                </div>
              ))}
          </div>
        </section>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticComponentProps = async (rendering, layoutData) => {
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

  // const query = `{
  //   item(path: "/sitecore/content/job-board-app/Data/Jobs", language: "en"){
  //     children {
  //       results {
  //         displayName
  //         fields {
  //           id
  //           name
  //           definition {
  //             name
  //           }
  //           jsonValue
  //         }
  //       }
  //     }
  //   }
  // }`;

  const result = await graphQLClient.request<any>(query, {
    datasource: rendering.dataSource,
    contextItem: layoutData?.sitecore?.route?.itemId,
    language: layoutData?.sitecore?.context?.language,
  });

  return result;
};

export default withDatasourceCheck()<MainComponentProps>(MainComponent);
