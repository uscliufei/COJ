import docker
import os
import shutil
import uuid

from docker.errors import *

IMAGE_NAME = "cojexecutor"

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))

print("CURRENT_DIR is {}".format(CURRENT_DIR))

TEMP_BUILD_DIR = "{}/tmp/".format(CURRENT_DIR)

client = docker.from_env()

SOURCE_FILE_NAMES = {
    "java" : "Example.java",
    'python' : 'example.py'
}

BINARY_NAMES = {
    "java" : "Example",
    'python' : 'example.py'
}

BUILD_COMMANDS = {
    "java" : "javac",
    'python' : 'python'
}

EXECUTE_COMMANDS = {
    "java" : "java",
    'python' : 'python'
}

def load_image():
	try:
		client.images.get(IMAGE_NAME)
	except ImageNotFound:
		print "ImageNotFound Please download from docker hub..."
		client.image.pull(IMAGE_NAME)
	except APIError:
		print "Image not found locally. DockerHub not accessible."
		return
	print "Image: {} loaded ".format(IMAGE_NAME)


def build_and_run(code, lang):
	# Docker
	result = {'build': None, 'run': None, 'error': None}

	source_file_parent_dir_name = uuid.uuid4()
	source_file_host_dir = "{}/{}".format(TEMP_BUILD_DIR, source_file_parent_dir_name)
	source_file_guest_dir = "/test/{}".format(source_file_parent_dir_name)
	make_dir(source_file_host_dir)

	with open("{}/{}".format(source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
		source_file.write(code)

	try:
		client.containers.run(
			image=IMAGE_NAME,
			command="{} {}".format( BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang] ),
			volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
			working_dir=source_file_guest_dir)
		print "Source built. "
		result['build'] = 'OK'
	except ContainerError as e:
		print "Build failed"
		result['build'] = e.stderr
		shutil.rmtree(source_file_host_dir)
		return result

	try:
		log = client.containers.run(
			image=IMAGE_NAME,
			command="{} {}".format( EXECUTE_COMMANDS[lang], BINARY_NAMES[lang]),
			volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
			working_dir=source_file_guest_dir)
		print "Executed!!! "
		result['run'] = log
	except ContainerError as e:
		print "Execution failed"
		result['run'] = e.stderr
		shutil.rmtree(source_file_host_dir)
		return result

	shutil.rmtree(source_file_host_dir)
	return result


def make_dir(dir):
	try:
		os.mkdir(dir)
		print("Temp build directory {} created".format(dir))
	except OSError:
		print "dir exited already!"