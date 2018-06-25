if github.branch_for_head == "development" && github.branch_for_base != "beta"
  fail "You can only merge from the development branch into beta."
end

if github.branch_for_head == "beta" && github.branch_for_base != "production"
  fail "You can only merge from the beta branch into production."
end

if github.branch_for_base == "development" && (github.branch_for_head == "beta" || github.branch_for_head == "production")
  fail "You cannot merge from the beta or production branches into development."
end

if github.branch_for_base == "beta" || github.branch_for_base == "production"
  if !(github.pr_title + github.pr_body).include?("#hotfix")
    if !git.diff_for_file("CHANGELOG.txt")
      fail 'You did not update the CHANGELOG.txt'
    end

    if !git.diff_for_file("Versionfile")
      fail 'You did not update the Versionfile'
    end
  end
end
