# Travis CI does not allow you to encrypt multiple files. only 1. Therefore, there must be a workaround where only 1 file is used. 
require 'trent'

ci = Trent.new({:local => true})

# These files here will be copied from the secrets directory into their respective location when decrypted. 
# Make sure that in the secrets directory when you encrypt, these files exist and are in this location. 
$secrets_to_cp = [
  "app/config/firebase_key.json"
]

# These files will not be copied from the secrets directory into their respective locatin when decrypted. 
# These only exist here as a reference for the developer who is encrypting the secrets to remember to include.  
$secrets_not_to_cp = [
  "production/.env",
  "staging/.env",
  "testing/.env",
  "development/.env"
]

def encrypt_files(ci)
  puts "--- encrypting secrets ---"
  
  $secrets_to_cp.each { |secret_file|
    ci.sh("echo \"Seeing if, secrets/#{secret_file} exists...\"")
    ci.sh("[ -a secrets/#{secret_file} ]")
  }
  $secrets_not_to_cp.each { |secret_file|
    ci.sh("echo \"Seeing if, secrets/#{secret_file} exists...\"")
    ci.sh("[ -a secrets/#{secret_file} ]")
  }
  ci.sh("tar cvf secrets.tar secrets")
  ci.sh("travis encrypt-file secrets.tar secrets.tar.enc")

  puts "--- encrypting secrets success! ---"
end 

def decrypt_files(ci)
  puts "--- decrypting secrets begin ---"

  ci.sh("openssl aes-256-cbc -K $encrypted_be7f82106121_key -iv $encrypted_be7f82106121_iv -in secrets.tar.enc -out secrets.tar -d")
  ci.sh("tar xvf secrets.tar")

  $secrets_to_cp.each { |secret_file|
    ci.sh("cp secrets/#{secret_file} #{secret_file}")
  }

  puts "--- decrypting secrets success! ---"
end 

if ARGV[0] == "encrypt"
  encrypt_files(ci)
elsif ARGV[0] == "decrypt"
  decrypt_files(ci)
end 