import React, { useState, useEffect } from 'react';
import {
  fetchUserRepos,
  fetchRepoContents,
  fetchMarkdownFile,
  parseGitHubUrl,
} from '../services/githubService';
import {
  FaGithub,
  FaFolder,
  FaFolderOpen,
  FaMarkdown,
  FaArrowLeft,
  FaSearch,
  FaSpinner,
} from 'react-icons/fa';

interface GitHubMarkdownSelectorProps {
  onSelectMarkdown: (content: string, fileName: string) => void;
  onClose: () => void;
}

export default function GitHubMarkdownSelector({
  onSelectMarkdown,
  onClose,
}: GitHubMarkdownSelectorProps) {
  const [username, setUsername] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('');
  const [repos, setRepos] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<
    Array<{ name: string; path: string }>
  >([]);
  const [view, setView] = useState<'username' | 'repos' | 'contents'>(
    'username'
  );

  // Reset states when changing views
  useEffect(() => {
    if (view === 'username') {
      setRepos([]);
      setContents([]);
      setBreadcrumbs([]);
      setPath('');
    }
  }, [view]);

  // Load repositories when username is submitted
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');

    try {
      const userRepos = await fetchUserRepos(username);
      setRepos(userRepos);
      setView('repos');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  // Handle repository URL input
  const handleRepoUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError('');

    try {
      const repoInfo = parseGitHubUrl(repoUrl);
      if (!repoInfo) {
        throw new Error('Invalid GitHub repository URL');
      }

      setOwner(repoInfo.owner);
      setRepo(repoInfo.repo);

      // Fetch repository contents
      const repoContents = await fetchRepoContents(
        repoInfo.owner,
        repoInfo.repo
      );
      setContents(repoContents);
      setPath('');
      setBreadcrumbs([{ name: repoInfo.repo, path: '' }]);
      setView('contents');
    } catch (err: any) {
      setError(err.message || 'Failed to load repository');
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on a repository
  const handleRepoClick = async (selectedRepo: any) => {
    setLoading(true);
    setError('');

    try {
      const repoContents = await fetchRepoContents(
        selectedRepo.owner.login,
        selectedRepo.name
      );
      setOwner(selectedRepo.owner.login);
      setRepo(selectedRepo.name);
      setContents(repoContents);
      setPath('');
      setBreadcrumbs([{ name: selectedRepo.name, path: '' }]);
      setView('contents');
    } catch (err: any) {
      setError(err.message || 'Failed to load repository contents');
    } finally {
      setLoading(false);
    }
  };

  // Handle directory navigation
  const handleDirectoryClick = async (item: any) => {
    if (item.type !== 'dir') return;

    setLoading(true);
    setError('');

    try {
      const dirContents = await fetchRepoContents(owner, repo, item.path);
      setContents(dirContents);
      setPath(item.path);

      // Update breadcrumbs
      const newPath = item.path;
      const pathParts = newPath.split('/');
      const newBreadcrumbs = pathParts.map((part: string, index: number) => {
        const pathUpToThisPart = pathParts.slice(0, index + 1).join('/');
        return { name: part, path: pathUpToThisPart };
      });

      setBreadcrumbs([{ name: repo, path: '' }, ...newBreadcrumbs]);
    } catch (err: any) {
      setError(err.message || 'Failed to load directory contents');
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on a markdown file
  const handleMarkdownClick = async (item: any) => {
    if (item.type !== 'file' || !item.name.endsWith('.md')) return;

    setLoading(true);
    setError('');

    try {
      const markdownContent = await fetchMarkdownFile(owner, repo, item.path);
      onSelectMarkdown(markdownContent, item.name);
    } catch (err: any) {
      setError(err.message || 'Failed to load markdown file');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  // Navigate to a specific breadcrumb
  const navigateToBreadcrumb = async (breadcrumb: {
    name: string;
    path: string;
  }) => {
    setLoading(true);
    setError('');

    try {
      const breadcrumbContents = await fetchRepoContents(
        owner,
        repo,
        breadcrumb.path
      );
      setContents(breadcrumbContents);
      setPath(breadcrumb.path);

      // Update breadcrumbs
      const index = breadcrumbs.findIndex((b) => b.path === breadcrumb.path);
      if (index >= 0) {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to navigate');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (view === 'contents') {
      // If we have breadcrumbs beyond the repo name, go up one directory
      if (breadcrumbs.length > 1) {
        const previousBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
        navigateToBreadcrumb(previousBreadcrumb);
      } else {
        // Go back to repos view
        setView('repos');
      }
    } else if (view === 'repos') {
      setView('username');
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 text-white rounded-lg overflow-hidden flex flex-col">
      <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center">
          <FaGithub className="text-2xl mr-2" />
          <h2 className="text-lg font-semibold">GitHub Markdown Selector</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-white"
        >
          &times;
        </button>
      </div>

      {error && (
        <div className="bg-red-900 text-white p-3 text-sm">Error: {error}</div>
      )}

      <div className="p-4 flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-3xl text-blue-500" />
          </div>
        ) : (
          <>
            {view === 'username' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Enter GitHub Username
                  </h3>
                  <form onSubmit={handleUsernameSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g., octocat"
                      className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2"
                      disabled={loading}
                    >
                      <FaSearch /> Search
                    </button>
                  </form>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-medium mb-2">
                    Or Enter Repository URL
                  </h3>
                  <form onSubmit={handleRepoUrlSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="e.g., https://github.com/user/repo"
                      className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2"
                      disabled={loading}
                    >
                      <FaSearch /> Load
                    </button>
                  </form>
                </div>
              </div>
            )}

            {view === 'repos' && repos.length > 0 && (
              <div>
                <button
                  onClick={goBack}
                  className="mb-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-1 text-sm"
                >
                  <FaArrowLeft /> Back
                </button>
                <h3 className="text-lg font-medium mb-3">
                  Repositories for {username}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => handleRepoClick(repo)}
                      className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-blue-500 cursor-pointer"
                    >
                      <div className="font-medium">{repo.name}</div>
                      <div className="text-sm text-gray-400 truncate">
                        {repo.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'contents' && (
              <div>
                <button
                  onClick={goBack}
                  className="mb-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-1 text-sm"
                >
                  <FaArrowLeft /> Back
                </button>

                {breadcrumbs.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mb-4 text-sm">
                    {breadcrumbs.map((breadcrumb, index) => (
                      <React.Fragment key={breadcrumb.path || 'root'}>
                        {index > 0 && <span className="text-gray-500">/</span>}
                        <button
                          onClick={() => navigateToBreadcrumb(breadcrumb)}
                          className="text-blue-400 hover:underline"
                        >
                          {breadcrumb.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  {contents.map((item) => (
                    <div
                      key={item.sha}
                      onClick={() =>
                        item.type === 'dir'
                          ? handleDirectoryClick(item)
                          : handleMarkdownClick(item)
                      }
                      className={`p-2 rounded flex items-center gap-2 cursor-pointer ${
                        item.type === 'file' && item.name.endsWith('.md')
                          ? 'hover:bg-blue-900/30'
                          : item.type === 'dir'
                          ? 'hover:bg-gray-700/50'
                          : 'text-gray-500 cursor-default'
                      }`}
                    >
                      {item.type === 'dir' ? (
                        <FaFolder className="text-yellow-500" />
                      ) : item.name.endsWith('.md') ? (
                        <FaMarkdown className="text-blue-400" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span
                        className={
                          item.type === 'dir' || item.name.endsWith('.md')
                            ? ''
                            : 'text-gray-500'
                        }
                      >
                        {item.name}
                      </span>
                    </div>
                  ))}

                  {contents.length === 0 && (
                    <div className="text-gray-500 italic p-4 text-center">
                      No files found in this directory
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
