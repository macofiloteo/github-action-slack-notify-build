const { context } = require('@actions/github');

function buildSlackAttachments({ status, color, github }) {
  const { payload, ref, workflow, eventName } = github.context;
  const { owner, repo } = context.repo;
  const event = eventName;
  const branch = event === 'pull_request' ? payload.pull_request.head.ref : ref.replace('refs/heads/', '');

  const sha = event === 'pull_request' ? payload.pull_request.head.sha : github.context.sha;
  const runId = parseInt(process.env.GITHUB_RUN_ID, 10);

  let referenceLink;
  switch (event) {
    case 'pull_request':
      referenceLink = {
        title: 'Pull Request',
        value: `<${payload.pull_request.html_url} | ${payload.pull_request.title}>`,
        short: true,
      };
      break;
    case 'workflow_dispatch':
      referenceLink = {
        title: 'Manually Triggered',
        value: `<https://github.com/${owner}/${repo}/commit/${sha} | ${branch}>`,
        short: true,
      };
      break;
    default:
      referenceLink = {
        title: 'Branch',
        value: `<https://github.com/${owner}/${repo}/commit/${sha} | ${branch}>`,
        short: true,
      };
  }

  customFields = [];
  if (event === 'workflow_dispatch') {
    const { inputs } = github.context;
    for (const eventInput of Object.keys(inputs)) {
      if (['string', 'boolean', 'number'].includes(typeof eventInput)) {
        customFields.push({
          title: `Input - ${eventInput}`,
          value: inputs[eventInput],
          short: true,
        });
      }
    }
  }

  return [
    {
      color,
      fields: [
        {
          title: 'Repo',
          value: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
          short: true,
        },
        {
          title: 'Workflow',
          value: `<https://github.com/${owner}/${repo}/actions/runs/${runId} | ${workflow}>`,
          short: true,
        },
        {
          title: 'Status',
          value: status,
          short: true,
        },
        referenceLink,
        ...customFields,
        {
          title: 'Event',
          value: event,
          short: true,
        },
      ],
      footer_icon: 'https://github.githubassets.com/favicon.ico',
      footer: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
      ts: Math.floor(Date.now() / 1000),
    },
  ];
}

module.exports.buildSlackAttachments = buildSlackAttachments;

function formatChannelName(channel) {
  return channel.replace(/[#@]/g, '');
}

module.exports.formatChannelName = formatChannelName;
