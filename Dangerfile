# File for the Danger bot: https://danger.systems/ruby/
# Used to inspect pull requests for us to prevent issues. 

ReleaseFile = Struct.new(:relative_file_path, :warn_or_fail, :deployment_instruction)

files_to_update_for_releases = [
  ReleaseFile.new('CHANGELOG.md', 'fail', "Add a new changelog entry detailing for future developers what has been done in the app."),
  ReleaseFile.new('Versionfile', 'fail', "Edit the symantic version of the release in the Versionfile.")  
]

deployment_instructions = []
deployment_instructions += files_to_update_for_releases.map { |release_file| "#{release_file.relative_file_path}: #{release_file.deployment_instruction}" }

def determineIfRelease(files_to_update_for_releases, deployment_instructions)
  num_files_updated = 0

  files_to_update_for_releases.each { |release_file_array|
    release_file_relative_path = release_file_array[0]
    release_file_warn_or_fail = release_file_array[1]

    if git.diff_for_file(release_file_relative_path) 
      if num_files_updated == 0        
        warn "🚀 I am going to assume that this *is a release* pull request because you have edited at least one file that would be updated for releases. 🚀"
      end 
      message "File: #{release_file_relative_path} edited."

      num_files_updated += 1
    else
      if num_files_updated > 0 # We only want to actually warn or fail if you forgot a file. If this PR is not a release, don't bother. 
        fail_message = "You did not update #{release_file_relative_path}, but you updated at least one file used for releases. Did you forget something?"
        if release_file_warn_or_fail == 'warn'
          warn fail_message
        else 
          fail fail_message
        end 
      end 
    end
  }

  if num_files_updated == 0
    message "I am going to assume that this is *not* a release pull request."
  end 
end 

if ENV["CI"] 
  if github.branch_for_base == "master"
    eslint.config_file = .eslintrc.json
    eslint.ignore_file = .eslintignore
    eslint.target_extensions = [".js", ".ts"]
    eslint.lint

    junit.parse "junit.xml"
    junit.show_skipped_tests = true
    if junit.failures.empty?
      message("#{junit.passes.length} tests passed!")
    else 
      junit.report
    end

    if !(github.pr_title + github.pr_body).include?("#hotfix")
      determineIfRelease(files_to_update_for_releases, deployment_instructions)
    end
  end
else 
  puts "It looks like you are looking for instructions on how to deploy your app, huh? Well, edit these files with these instructions: \n\n"
  puts deployment_instructions  
end 