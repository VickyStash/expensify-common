import {Octokit} from '@octokit/rest';
import GithubUtils from '../lib/GithubUtils';

describe('GithubUtils', () => {
    describe('getStagingDeployCash', () => {
        const issue = {
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
            title: 'Andrew Test Issue',
            labels: [
                {
                    id: 2783847782,
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                    name: 'StagingDeployCash',
                    color: '6FC269',
                    default: false,
                    description: ''
                }
            ],
            // eslint-disable-next-line max-len
            body: '**Release Version:** `1.0.1-472`\r\n**Compare Changes:** https://github.com/Expensify/Expensify.cash/compare/1.0.1-400...1.0.1-401\r\n**This release contains changes from the following pull requests:**\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/21\r\n- [x] https://github.com/Expensify/Expensify.cash/pull/22\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/23\r\n\r\n**Deploy Blockers:**\r\n- [ ] https://github.com/Expensify/Expensify.cash/issues/1\r\n- [x] https://github.com/Expensify/Expensify.cash/issues/2\r\n- [ ] https://github.com/Expensify/Expensify.cash/pull/1234\r\n',
        };

        const expectedResponse = {
            PRList: [
                'https://github.com/Expensify/Expensify.cash/pull/21',
                'https://github.com/Expensify/Expensify.cash/pull/22',
                'https://github.com/Expensify/Expensify.cash/pull/23'
            ],
            deployBlockers: [
                'https://github.com/Expensify/Expensify.cash/issues/1',
                'https://github.com/Expensify/Expensify.cash/issues/2',
                'https://github.com/Expensify/Expensify.cash/pull/1234',
            ],
            comparisonURL: 'https://github.com/Expensify/Expensify.cash/compare/1.0.1-400...1.0.1-401',
            labels: [
                {
                    color: '6FC269',
                    default: false,
                    description: '',
                    id: 2783847782,
                    name: 'StagingDeployCash',
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash'
                }
            ],
            tag: '1.0.1-472',
            title: 'Andrew Test Issue',
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29'
        };

        test('Test finding an open issue successfully', () => {
            const octokit = new Octokit();
            const github = new GithubUtils(octokit);
            octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [issue]});
            return github.getStagingDeployCash().then(data => expect(data).toStrictEqual(expectedResponse));
        });

        test('Test finding an open issue without a body', () => {
            const octokit = new Octokit();
            const github = new GithubUtils(octokit);

            const noBodyIssue = issue;
            noBodyIssue.body = '';

            octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [noBodyIssue]});
            return github.getStagingDeployCash()
                .catch(e => expect(e).toEqual(new Error('Unable to find StagingDeployCash issue with correct data.')));
        });

        test('Test finding more than one issue', () => {
            const octokit = new Octokit();
            const github = new GithubUtils(octokit);
            octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: [{a: 1}, {b: 2}]});
            return github.getStagingDeployCash()
                .catch(e => expect(e).toEqual(new Error('Found more than one StagingDeployCash issue.')));
        });

        test('Test finding no issues', () => {
            const octokit = new Octokit();
            const github = new GithubUtils(octokit);
            octokit.issues.listForRepo = jest.fn().mockResolvedValue({data: []});
            return github.getStagingDeployCash()
                .catch(e => expect(e).toEqual(new Error('Unable to find StagingDeployCash issue.')));
        });
    });

    describe('getPullRequestNumberFromURL', () => {
        describe('valid pull requests', () => {
            test.each([
                ['https://github.com/Expensify/Expensify/pull/156369', '156369'],
                ['https://github.com/Expensify/Expensify.cash/pull/1644', '1644'],
                ['https://github.com/Expensify/expensify-common/pull/346', '346'],
            ])('getPullRequestNumberFromURL("%s")', (input, expected) => {
                expect(GithubUtils.getPullRequestNumberFromURL(input)).toBe(expected);
            });
        });

        describe('invalid pull requests', () => {
            test.each([
                ['https://www.google.com/'],
                ['https://github.com/Expensify/Expensify/issues/156481'],
                ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#'],
            ])('getPullRequestNumberFromURL("%s")', (input) => {
                expect(() => GithubUtils.getPullRequestNumberFromURL(input))
                    .toThrow(new Error(`Provided URL ${input} is not a Github Pull Request!`));
            });
        });
    });

    describe('getIssueNumberFromURL', () => {
        describe('valid issues', () => {
            test.each([
                ['https://github.com/Expensify/Expensify/issues/156369', '156369'],
                ['https://github.com/Expensify/Expensify.cash/issues/1644', '1644'],
                ['https://github.com/Expensify/expensify-common/issues/346', '346'],
            ])('getIssueNumberFromURL("%s")', (input, expected) => {
                expect(GithubUtils.getIssueNumberFromURL(input)).toBe(expected);
            });
        });

        describe('invalid issues', () => {
            test.each([
                ['https://www.google.com/'],
                ['https://github.com/Expensify/Expensify/pull/156481'],
                ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#'],
            ])('getIssueNumberFromURL("%s")', (input) => {
                expect(() => GithubUtils.getIssueNumberFromURL(input))
                    .toThrow(new Error(`Provided URL ${input} is not a Github Issue!`));
            });
        });
    });

    describe('getIssueOrPullRequestNumberFromURL', () => {
        describe('valid issues and pull requests', () => {
            test.each([
                ['https://github.com/Expensify/Expensify/issues/156369', '156369'],
                ['https://github.com/Expensify/Expensify.cash/issues/1644', '1644'],
                ['https://github.com/Expensify/expensify-common/issues/346', '346'],
                ['https://github.com/Expensify/Expensify/pull/156369', '156369'],
                ['https://github.com/Expensify/Expensify.cash/pull/1644', '1644'],
                ['https://github.com/Expensify/expensify-common/pull/346', '346'],
            ])('getIssueOrPullRequestNumberFromURL("%s")', (input, expected) => {
                expect(GithubUtils.getIssueOrPullRequestNumberFromURL(input)).toBe(expected);
            });
        });

        describe('invalid issues/pull requests', () => {
            test.each([
                ['https://www.google.com/'],
                ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#'],
            ])('getIssueOrPullRequestNumberFromURL("%s")', (input) => {
                expect(() => GithubUtils.getIssueOrPullRequestNumberFromURL(input))
                    .toThrow(new Error(`Provided URL ${input} is not a valid Github Issue or Pull Request!`));
            });
        });
    });

    describe('generateStagingDeployCashBody', () => {
        const octokit = new Octokit();
        const githubUtils = new GithubUtils(octokit);

        // TODO: mock octokit w/ tag so comparison URL is consistent.
        const tag = '1.0.2-123';
        const comparisonURL = 'https://github.com/Expensify/Expensify.cash/compare/1.0.2...1.0.2-123';
        const basePRList = [
            'https://github.com/Expensify/Expensify/pull/2',
            'https://github.com/Expensify/Expensify/pull/3',
            'https://github.com/Expensify/Expensify/pull/3',
            'https://github.com/Expensify/Expensify/pull/1',
        ];

        const baseDeployBlockerList = [
            'https://github.com/Expensify/Expensify/pull/3',
            'https://github.com/Expensify/Expensify/issues/4',
        ];

        // eslint-disable-next-line max-len
        // TODO: Add comparison URL to base expected output
        const baseExpectedOutput = `**Release Version:** ${tag}\r\n**Compare Changes:** \r\n**This release contains changes from the following pull requests:**\r\n`;
        const openCheckbox = '- [ ]';
        const closedCheckbox = '- [x]';

        test('Test no verified PRs', () => {
            // eslint-disable-next-line max-len
            expect(githubUtils.generateStagingDeployCashBody(tag, basePRList)).toBe(`${baseExpectedOutput}${openCheckbox} ${basePRList[3]}\r\n${openCheckbox} ${basePRList[0]}\r\n${openCheckbox} ${basePRList[1]}\r\n`);
        });

        test('Test some verified PRs', () => {
            // eslint-disable-next-line max-len
            expect(githubUtils.generateStagingDeployCashBody(tag, basePRList, [basePRList[0]])).toBe(`${baseExpectedOutput}${openCheckbox} ${basePRList[3]}\r\n${closedCheckbox} ${basePRList[0]}\r\n${openCheckbox} ${basePRList[1]}\r\n`);
        });

        // eslint-disable-next-line max-len
        const allVerifiedExpectedOutput = `${baseExpectedOutput}${closedCheckbox} ${basePRList[3]}\r\n${closedCheckbox} ${basePRList[0]}\r\n${closedCheckbox} ${basePRList[1]}\r\n`;
        test('Test all verified PRs', () => {
            expect(githubUtils.generateStagingDeployCashBody(tag, basePRList, basePRList))
                .toBe(allVerifiedExpectedOutput);
        });

        const deployBlockerHeader = '\r\n**Deploy Blockers:**\r\n';
        test('Test no resolved deploy blockers', () => {
            expect(githubUtils.generateStagingDeployCashBody(tag, basePRList, basePRList, baseDeployBlockerList))
                .toBe(`${allVerifiedExpectedOutput}${deployBlockerHeader}${openCheckbox} ${baseDeployBlockerList[0]}\r\n${openCheckbox} ${baseDeployBlockerList[1]}\r\n`);
        });

        test('Test some resolved deploy blockers', () => {
            expect(githubUtils.generateStagingDeployCashBody(tag, basePRList, basePRList, baseDeployBlockerList, [baseDeployBlockerList[0]]))
                .toBe(`${allVerifiedExpectedOutput}${deployBlockerHeader}${closedCheckbox} ${baseDeployBlockerList[0]}\r\n${openCheckbox} ${baseDeployBlockerList[1]}\r\n`);
        });

        test('Test all resolved deploy blockers', () => {
            expect(githubUtils.generateStagingDeployCashBody(tag, basePRList, basePRList, baseDeployBlockerList, baseDeployBlockerList))
                .toBe(`${allVerifiedExpectedOutput}${deployBlockerHeader}${closedCheckbox} ${baseDeployBlockerList[0]}\r\n${closedCheckbox} ${baseDeployBlockerList[1]}\r\n`)
        });
    })
})
