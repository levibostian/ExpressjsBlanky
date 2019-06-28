
if github.branch_for_base == "master"
  if !(github.pr_title + github.pr_body).include?("#hotfix")
    if !git.diff_for_file("CHANGELOG.md")
      fail 'You did not update the CHANGELOG.md'
    end

    if !git.diff_for_file("Versionfile")
      fail 'You did not update the Versionfile'
    end
  end
end
