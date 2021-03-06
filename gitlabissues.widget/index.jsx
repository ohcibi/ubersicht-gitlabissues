/* global fetch */
/**
 * BEGIN HEADER
 *
 * Contains:        GitLabIssues Widget for <http://tracesof.net/uebersicht/>
 * Maintainer:      Chase Putans
 * License:         GNU GPL v3
 *
 * Description:     This file contains the code for the GitlabIssues Widget for the
 *                  macOS software Übersicht.  Based on the GitIssues Widget 
 *                  <https://github.com/nathanlesage/ubersicht-gitissues> 
 *
 * END HEADER
 */
import { css } from "uebersicht"


export const params = {
    'gitlab_url': 'gitlab.com', //url of gitlab instance
    'access_token': 'ACCESS_TOKEN', // personal access token
    'project_id': 1, // project id 
    'issue_count': 15,  // number of issues to show 
    'update_frequency': 5 // number of minutes between updates
}

export const command = (dispatch) => {
  return fetch('https://' + params.gitlab_url + '/api/v4/projects/' + params.project_id + '/issues?private_token=' + params.access_token + '&state=opened')
    .then(resp => resp.json())
    .then(data => { dispatch({ type: 'FETCH_SUCCEDED', data }); })
    .catch(error => { dispatch({ type: 'FETCH_FAILED', error }); });
};

export const refreshFrequency = parseInt(params.update_frequency * 60000); 

export const render = ({output, updated, error}) => {
  if (error) {
    return (<div>Unable to retrieve issues: <strong>{String(error)}</strong></div>);
  }

  if (output.constructor === Array) {
    return (
      <div>
        <h1>Gitlab Issues <small>(Updated at: {updated})</small></h1>
        <table className={table}>
          <thead>
            <tr>
              <td className={tableHeader}>Number</td>
              <td className={tableHeader}>Issue</td>
              <td className={tableHeader}>Author</td>
              <td className={tableHeader}>Created</td>
            </tr>
          </thead>
          <tbody>
            {output.map((issue, i) => {
              if (i % 2 == 0) {
                var rowClass = css({
                  padding: 5
                })
              }
              else {
                var rowClass = css({
                  backgroundColor: 'rgba(160, 160, 160, 0.1)',
                  padding: 5
                })
              }
              return (
                <tr key={i}>
                  <td className={rowClass}>
                    #{issue.iid}
                  </td>
                  <td className={rowClass}>
                    {issue.title}
                  </td>
                  <td className={rowClass}>
                    <img src={issue.author_avatar} height='16' width='16' />  {issue.author}
                  </td>
                  <td className={rowClass}>
                    {issue.created}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return output;
}

export const initialState = { output: 'Fetching issues...' };

export const updateState = (event, previousState) => {
  if (event.error) {
    console.warn(event.error);
    return { ...previousState, warning: `Error occured: ${event.error}` }
  }

  if (event.type !== 'FETCH_SUCCEDED') {
    return previousState;
  }

  const now = new Date();
  return {
    updated: `${now.getHours()}:${now.getMinutes()}`,
    output: event.data.slice(0, params.issue_count).map(issue => {
      const created = new Date(issue.created_at);
      const month = (month => month)(created)
      debugger
      return {
        iid: issue.iid,
        title: issue.title,
        author: issue.author.name,
        author_avatar: issue.author.avatar_url,
        created: `${created.getFullYear()}-${created.getMonth() + 1}-${created.getDate()} ${created.getHours()}:${created.getMinutes()}`,
        url: issue.web_url
      };
    })
  };
}

export const className = {
  top: 10,
  right: 10,
  backgroundColor: 'rgba(200, 200, 200, 0.2)',
  color: '#FFF',
  borderRadius: 5,
  padding: 10,
  fontSize: 11,
  fontFamily: 'Helvetica'
}

export const table = css({
  borderCollapse: 'collapse',
})

export const tableHeader = css({
  borderBottom: '1px solid #FFF',
  fontWeight: 'bold',
  padding: 5
})
