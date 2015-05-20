REQUIRED?=7.1.0-31950
SVN_REVISION?=$(shell svn info |grep Revision|awk '{print $$2}')
TARGET=zarafa-webapp-${SVN_REVISION}

clean:
	ant clean
	rm -f *.spec *.tar.gz *.rpm *.deb *.changes antdeploy

.SUFFIXES: .spec.m4 .spec
.spec.m4.spec:
	m4 -DREVISION=${SVN_REVISION} -DWAVERSION=`cat version` -DDATE="`LC_TIME=C date \"+%a %b %d %Y\"`" -DZARAFA_VERSION_REQUIRED=${REQUIRED} -DDISTRO=${DISTRO} $< > $@
	ls -l $@

buildclean:
	rm -rf zarafa-webapp*.tar.gz ${TARGET} antdeploy

antdeploy: buildclean build.xml
	ant deploy
	ant deploy-plugins
	touch antdeploy

zarafa-webapp.tar.gz: antdeploy
	rm -rf ${TARGET}
	mkdir ${TARGET}
	# add revision to version file
	sed -i -e 's/\(.*\)$$/\1-${SVN_REVISION}/' deploy/version
	mv deploy ${TARGET}
	mv zarafa-webapp.spec ${TARGET} || true
	cp -p AGPL-3 ${TARGET}
	tar zcpf $@ ${TARGET}
	rm -rf ${TARGET}

zarafa-webapp.rpm: zarafa-webapp.spec zarafa-webapp.tar.gz
	rpmbuild --clean --nodeps -tb zarafa-webapp.tar.gz
	mv -v `rpm -E %{_topdir}`/RPMS/noarch/*rpm .
	rm -rf zarafa-webapp.tar.gz

zarafa-webapp.deb: zarafa-webapp.tar.gz
	rm -rf ${TARGET}
	tar zxpf zarafa-webapp.tar.gz
	REQUIRED=$(REQUIRED) ./zarafa-webapp.debian ${TARGET}
	rm -rf zarafa-webapp.tar.gz

zarafa-webapp-source.tar.gz: buildclean
	mkdir ${TARGET}
	svn export . ${TARGET}/source
	cd ${TARGET}/source && rm -rf Makefile *.debian *.spec.m4 manual projspec tools client/design client/*xml test
	find ${TARGET} -type f -name build.xml -exec rm -f {} \;
	mv zarafa-webapp-source.spec ${TARGET} || true
	cp -p AGPL-3 ${TARGET}
	tar zcpf $@ ${TARGET}
	rm -rf ${TARGET}

zarafa-webapp-source.rpm: zarafa-webapp-source.spec zarafa-webapp-source.tar.gz
	rpmbuild --clean --nodeps -tb zarafa-webapp-source.tar.gz
	mv -v `rpm -E %{_topdir}`/RPMS/noarch/*rpm .
	rm -rf zarafa-webapp-source.tar.gz

zarafa-webapp-source.deb: zarafa-webapp-source.tar.gz
	rm -rf ${TARGET}
	tar zxpf zarafa-webapp-source.tar.gz
	REQUIRED=$(REQUIRED) ./zarafa-webapp-source.debian ${TARGET}
	rm -rf zarafa-webapp-source.tar.gz

debian:
	SVN_REVISION=${SVN_REVISION} $(MAKE) zarafa-webapp.deb
debian-source:
	SVN_REVISION=${SVN_REVISION} $(MAKE) zarafa-webapp-source.deb
rhel:
	SVN_REVISION=${SVN_REVISION} DISTRO=rhel $(MAKE) zarafa-webapp.rpm
rhel-source:
	SVN_REVISION=${SVN_REVISION} DISTRO=rhel $(MAKE) zarafa-webapp-source.rpm
sles:
	SVN_REVISION=${SVN_REVISION} DISTRO=sles $(MAKE) zarafa-webapp.rpm
sles-source:
	SVN_REVISION=${SVN_REVISION} DISTRO=sles $(MAKE) zarafa-webapp-source.rpm
