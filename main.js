(function () {
    'use strict';

    async function downloadNamesFromCourse$2 (year, term, code, section, excludeRepeats = false) {
        const url = `/page/grp2013.fhtml?ders_kod=${code}&sube=${section}&yil=${year}&donem=${term}&printable=1`;
        let res = await fetch(url);
        let text = await res.text();
        // TODO: add error handling
        let sheet = document.createElement("div");
        sheet.innerHTML = text;
        let students = Array.from(sheet.querySelectorAll("form > table > tbody > tr"))
            .slice(1)
            .map((student) => {
                let cells = Array.from(student.querySelectorAll("td"));
                let studentData = {
                    id: cells[3].innerText,
                    name: cells[4].innerText,
                    isRepeat: cells[1].innerText == "R",
                };
                return studentData;
            });
        if (excludeRepeats) students = students.filter(s => !s.isRepeat);
        return { code, students, section };
    }

    async function saveFile (filename, content, mime = 'text/plain') {
        let a = document.createElement("a");
        let file = new Blob([content], {
            type: mime,
        });
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
    }

    // module.exports = async function() {
    async function namesDownloaderHomePage () {
        console.log("loaded: names downloader (home page)");
        const parentTd = document.querySelector('body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td');
        const dailyLoginH4 = document.querySelector("body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > h4:nth-child(3)");

        if (!dailyLoginH4) {
            console.log('could not find buttons container');
            return
        }

        const enahncedPisH4 = document.createElement('h4');
        enahncedPisH4.innerText = 'PIS Enhanced';
        parentTd.insertBefore(enahncedPisH4, dailyLoginH4);

        const courseDownloaderTable = document.createElement('div');
        courseDownloaderTable.innerHTML = `<table border="0" cellspacing="1" cellpadding="2" width="100%">
    <tbody>
        <tr>
            <td align="right" class="tabletitle" width="20%">YEAR:</td>
            <td class="box">
                <input id="year_input" type="text" class="formin" size="20" maxlength="20" />
            </td>
        </tr>
        <tr>
            <td align="right" class="tabletitle" width="20%">TERM</td>
            <td class="box">
                <input id="term_input" type="text"  class="formin"/>
            </td>
        </tr>
        <tr>
            <td align="right" class="tabletitle" width="20%">COURSE CODES:</td>
            <td class="box">
                <textarea
                    id="courses_textarea"
                    class="formin"
                    cols="55"
                    rows="5"
                    style="width: 360px; height: 144px"
                ></textarea>
            </td>
        </tr>
        
        <tr>
            <td align="right"></td>
            <td><button id="download_names_btn" class="formbutton">Download names</button></td>
        </tr>
    </tbody>
</table>
`;
        parentTd.insertBefore(courseDownloaderTable, dailyLoginH4);

        const downloadNamesBtn = document.getElementById('download_names_btn');
        const yearInput = document.getElementById('year_input');
        const termInput = document.getElementById('term_input');
        const coursesTextarea = document.getElementById('courses_textarea');

        downloadNamesBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const year = yearInput.value;
            const term = termInput.value;

            if (!/^\d{4}$/.test(year)) {
                const errorMessage = `Invlid year: "${year}"`;
                alert(errorMessage);
                throw new Error(errorMessage)
            }

            if (!/^\d{1}$/.test(term)) {
                const errorMessage = `Invlid term: "${term}"`;
                alert(errorMessage);
                throw new Error(errorMessage)
            }

            const courses = [];
            coursesTextarea.value.split('\n')
                .forEach(c => {
                    if (!c) return
                    if (!/^[A-Z]{2,4} \d{3}\/[A-Z]$/.test(c)) {
                        const msg = `Invalid course code: "${c}". Correct format is:\n\n^[A-Z]{2,4} \\d{3}\\/[A-Z]$`;
                        alert(msg);
                        throw new Error(msg)
                    }
                    c = c.split('/');
                    c = { code: c[0], section: c[1] };
                    courses.push(c);
                });

            let allStudents = {};

            let studentsData = await Promise.all(
                courses.map(({ code, section }) => downloadNamesFromCourse$2(year, term, code, section))
            );
            studentsData.forEach(({ code, students }) => {
                if (!(code in allStudents)) {
                    allStudents[code] = [];
                }
                students.forEach((s) => allStudents[code].push(s));
            });

            saveFile(`Students_${new Date().toISOString()}.json`, JSON.stringify(allStudents));
        });
    }

    async function downloadNamesFromCourse$1(year, term, code, section, excludeRepeats = false) {
        const url = `/page/grp2013.fhtml?ders_kod=${code}&sube=${section}&yil=${year}&donem=${term}&printable=1`;
        let res = await fetch(url);
        let text = await res.text();
        // TODO: add error handling
        let sheet = document.createElement("div");
        sheet.innerHTML = text;
        let students = Array.from(sheet.querySelectorAll("form > table > tbody > tr"))
            .slice(1)
            .map((student) => {
                let cells = Array.from(student.querySelectorAll("td"));
                let studentData = {
                    id: cells[3].innerText,
                    name: cells[4].innerText,
                    isRepeat: cells[1].innerText == "R",
                };
                return studentData;
            });
        if (excludeRepeats) students = students.filter(s => !s.isRepeat);
        return { code, students, section };
    }

    async function downloadNamesFromCourseMinors$1(year, term, code, section) {
        const url = `/page/grp20154.fhtml?derskod=${code}&sube=${section}&yil=${year}&donem=${term}&printable=1`;
        let res = await fetch(url);
        let text = await res.text();
        // TODO: add error handling
        let sheet = document.createElement("div");
        sheet.innerHTML = text;

        let students = Array.from(sheet.querySelectorAll("td"))
            .find((td) => td.innerText == "End of Term Grade(/100)")
            .parentElement.parentElement.querySelectorAll("tr");

        students = Array.from(students)
            .slice(1)
            .map((student) => {
                let cells = Array.from(student.querySelectorAll("td"));
                const grade = cells[cells.length - 2].innerText.split("(")[0];
                let studentData = {
                    id: cells[1].innerText,
                    name: cells[2].innerText,
                    isRepeat: false,
                    grade,
                };
                return studentData;
            });
        return { code, students, section };
    }

    async function downloadMakeupNamesFromCourse$1(year, term, code, section) {
        const url = `https://pis.tiu.edu.iq/page/finalmakeupyeni.php?derskod=${code}&sube=${section}&yil=${year}&donem=${term}`;
        let res = await fetch(url);
        let text = await res.text();

        let sheet = document.createElement("div");
        sheet.innerHTML = text;
        console.log(text);
        let students = Array.from(sheet.querySelectorAll("#table_data tr"))
            .slice(1, -1)
            .map((student) => {
                let cells = Array.from(student.querySelectorAll("td"));
                let studentData = {
                    id: cells[1].innerText,
                    name: cells[2].innerText,
                    isRepeat: false,
                    prefinalGrade: cells[4].innerText,
                    finalGrade: cells[5].innerText,
                };
                return studentData;
            });
        return { code, students, section };
    }

    const copyEmailsFromCourse = async (e, year, term, code, section) => {
        //todo: add error handling
        let { students } = await downloadNamesFromCourse$1(year, term, code, section);
        let emails = [];
        let done = 0;
        e.target.innerText = `copy E-mails ${done}/${students.length}`;
        for (let student of students) {
            await fetch(`/page/grp709.php?stno=${student.id}`);
            let res = await fetch(`/page/grp701.php`);
            let studentPage = document.createElement("div");
            studentPage.innerHTML = await res.text();

            let email = Array.from(studentPage.querySelectorAll("tr"))
                .filter((tr) => tr.innerText.startsWith("Personal E-Mail"))
                .map((tr) => tr.querySelector("td:nth-child(2)"))[0].innerText;
            emails.push(email);
            done += 1;
            e.target.innerText = `copy E-mails ${done}/${students.length}`;
        }
        let emailsString = emails.join("\n");
        navigator.clipboard.writeText(emailsString);
        e.target.innerText = `copy E-mails`;
    };

    const getCourseInfo$1 = (row) => {
        let code = row.querySelector("td:nth-child(3)").innerText;
        code = /([A-Z]{2,4} \d{3}\/[A-Z]).*/.exec(code);
        if (code.length == 0) return null;

        let section;
        [code, section] = code[0].split("/");
        return { code, section };
    };

    const downloadCourseDescription$1 = async (year, code) => {
        const url = `https://pis.tiu.edu.iq/page/descriptions.php?yil=${year}&ders_kod=${code}&bol_no=1739`;

        let res = await fetch(url);
        let text = await res.text();
        // TODO: add error handling
        let sheet = document.createElement("div");
        sheet.innerHTML = text;

        const table = Array.from(sheet.querySelectorAll("td")).find((td) => td.innerText === "Course code:").parentElement
            .parentElement;

        const info = {};
        table.querySelectorAll("input,textarea").forEach((row) => (info[row.attributes.name.value] = row.value));

        return info;
    };

    // module.exports = async function() {
    async function namesDownloaderCourseManagement () {
        console.log("loaded: names downloader");
        const buttonsContainer = document.querySelector("div.dt-buttons");
        const downloadNamesBtn = document.createElement("button");
        const downloadNamesNoRepeatBtn = document.createElement("button");
        const downloadNamesFromMinorsBtn = document.createElement("button");
        const downloadMakeupNamesBtn = document.createElement("button");
        const downloadCourseDescriptionBtn = document.createElement("button");

        downloadNamesBtn.innerText = "JSON";
        downloadNamesNoRepeatBtn.innerText = "JSON (no repeat)";
        downloadNamesFromMinorsBtn.innerText = "JSON (with final marks)";
        downloadMakeupNamesBtn.innerText = "JSON (makeup)";
        downloadCourseDescriptionBtn.innerText = "Course description (Text)";

        buttonsContainer.appendChild(downloadNamesBtn);
        buttonsContainer.appendChild(downloadNamesNoRepeatBtn);
        buttonsContainer.appendChild(downloadNamesFromMinorsBtn);
        buttonsContainer.appendChild(downloadMakeupNamesBtn);
        buttonsContainer.appendChild(downloadCourseDescriptionBtn);

        const rows = document.querySelectorAll("#table_data > tbody > tr");
        const [year, term] = document.querySelectorAll("h4 > font")[0].innerText.trim().split("/");

        let courses = [];
        const seenCourses = new Set();
        for (let row of rows) {
            const courseInfo = getCourseInfo$1(row);
            const courseKey = `${courseInfo.code}/${courseInfo.section}`;
            if (seenCourses.has(courseKey)) continue

            courseInfo.year = year;
            courseInfo.term = term;
            courses.push(courseInfo);

            let lastCell = row.querySelector("td:nth-child(14)");
            let emailsA = document.createElement("a");
            emailsA.href = "#";
            emailsA.innerText = "copy E-mails";
            emailsA.onclick = (e) => {
                e.preventDefault();
                copyEmailsFromCourse(e, year, term, courseInfo.code, courseInfo.section);
            };
            lastCell.appendChild(document.createElement("br"));
            lastCell.appendChild(emailsA);
        }

        downloadNamesBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let allStudents = {};

            let studentsData = await Promise.all(
                courses.map(({ code, section }) => downloadNamesFromCourse$1(year, term, code, section))
            );
            studentsData.forEach(({ code, students }) => {
                if (!(code in allStudents)) {
                    allStudents[code] = [];
                }
                students.forEach((s) => allStudents[code].push(s));
            });

            let a = document.createElement("a");
            let file = new Blob([JSON.stringify(allStudents)], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `allStudents_${year}_${term}_${new Date().toISOString()}.json`;
            a.click();
        });

        downloadNamesNoRepeatBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let allStudents = {};

            let studentsData = await Promise.all(
                courses.map(({ code, section }) => downloadNamesFromCourse$1(year, term, code, section, true))
            );
            studentsData.forEach(({ code, students }) => {
                if (!(code in allStudents)) {
                    allStudents[code] = [];
                }
                students.forEach((s) => allStudents[code].push(s));
            });

            let a = document.createElement("a");
            let file = new Blob([JSON.stringify(allStudents)], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `allStudents_${year}_${term}_${new Date().toISOString()}.json`;
            a.click();
        });

        //todo refactor the callback
        downloadMakeupNamesBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let allStudents = {};

            let studentsData = await Promise.all(
                courses.map(({ code, section }) => downloadMakeupNamesFromCourse$1(year, term, code, section))
            );

            studentsData.forEach(({ code, students, section }) => {
                if (!(code in allStudents)) {
                    allStudents[code] = [];
                }
                students.forEach((s) => allStudents[code].push(s));
            });

            let a = document.createElement("a");
            let file = new Blob([JSON.stringify(allStudents)], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `allMakeupStudentsWithGrades_${year}_${term}_${new Date().toISOString()}.json`;
            a.click();
        });

        downloadNamesFromMinorsBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let allStudents = {};

            let studentsData = await Promise.all(
                courses.map(({ code, section }) => downloadNamesFromCourseMinors$1(year, term, code, section))
            );
            studentsData.forEach(({ code, students }) => {
                if (!(code in allStudents)) {
                    allStudents[code] = [];
                }
                students.forEach((s) => allStudents[code].push(s));
            });

            let a = document.createElement("a");
            let file = new Blob([JSON.stringify(allStudents)], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `allStudentsWithFinalGrades_${year}_${term}_${new Date().toISOString()}.json`;
            a.click();
        });

        downloadCourseDescriptionBtn.addEventListener("click", async (e) => {
            //todo: refactor
            e.preventDefault();

            const seen = new Set();
            let result = "";
            let coursesInfo = await Promise.all(courses.map((course) => downloadCourseDescription$1(year, course.code)));
            coursesInfo = coursesInfo.sort((a, b) => a.ders_kod.localeCompare(b.ders_kod));

            for (const course of coursesInfo) {
                if (seen.has(course.ders_kod)) continue;

                seen.add(course.ders_kod);
                result += `Course code: ${course.ders_kod}\n`;
                result += `Course name: ${course.ders_adi}\n`;
                result += `Year: ${course.yil}\n`;
                result += `Department: -\n`;
                result += `Term: ${course.donem}\n`;
                result += `Teoric: ${course.teorik}\n`;
                result += `Practical: ${course.pratik}\n`;
                result += `Credit: ${course.kredi}\n`;
                result += `Reference: ${course.ref_kod}\n`;
                result += `Somestre: ${course.somestre}\n`;
                result += `Ects: ${course.ects}\n`;
                result += `Load: ${course.toplam_yuk}\n`;
                result += `Prerequisite: ${course.onc_ders_kod}\n`;
                result += `Category: ${course.kategori}\n`;
                result += `Description: ${course.aciklama}\n`;
                result += `================================================`;
                result += `\n\n`;
            }

            let a = document.createElement("a");
            let file = new Blob([result], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `courseDescriptions_${year}_${term}_${new Date().toISOString()}.json`;
            a.click();
            console.log(result);
        });
    }

    async function downloadNamesFromCourse(year, term, code, section, excludeRepeats = false) {
        const url = `/page/grp2013.fhtml?ders_kod=${code}&sube=${section}&yil=${year}&donem=${term}&printable=1`;
        let res = await fetch(url);
        let text = await res.text();
        // TODO: add error handling
        let sheet = document.createElement("div");
        sheet.innerHTML = text;
        let students = Array.from(sheet.querySelectorAll("form > table > tbody > tr"))
            .slice(1)
            .map((student) => {
                let cells = Array.from(student.querySelectorAll("td"));
                let studentData = {
                    id: cells[3].innerText,
                    name: cells[4].innerText,
                    isRepeat: cells[1].innerText == "R",
                };
                return studentData;
            });
        if (excludeRepeats) students = students.filter(s => !s.isRepeat);
        return { code, students, section };
    }

    async function downloadNamesFromCourseMinors(year, term, code, section) {
        const url = `/page/grp20154.fhtml?derskod=${code}&sube=${section}&yil=${year}&donem=${term}&printable=1`;
        let res = await fetch(url);
        let text = await res.text();
        // TODO: add error handling
        let sheet = document.createElement("div");
        sheet.innerHTML = text;

        let students = Array.from(sheet.querySelectorAll("td"))
            .find((td) => td.innerText == "End of Term Grade(/100)")
            .parentElement.parentElement.querySelectorAll("tr");

        students = Array.from(students)
            .slice(1)
            .map((student) => {
                let cells = Array.from(student.querySelectorAll("td"));
                const grade = cells[cells.length - 2].innerText.split("(")[0];
                let studentData = {
                    id: cells[1].innerText,
                    name: cells[2].innerText,
                    isRepeat: false,
                    grade,
                };
                return studentData;
            });
        return { code, students, section };
    }

    async function downloadMakeupNamesFromCourse(year, term, code, section) {
        const url = `https://pis.tiu.edu.iq/page/finalmakeupyeni.php?derskod=${code}&sube=${section}&yil=${year}&donem=${term}`;
        let res = await fetch(url);
        let text = await res.text();

        let sheet = document.createElement("div");
        sheet.innerHTML = text;

        let students = Array.from(sheet.querySelectorAll("#table_data tr"))
            .slice(1, -1)
            .map((student) => {
                let cells = Array.from(student.querySelectorAll("td"));
                let studentData = {
                    id: cells[1].innerText,
                    name: cells[2].innerText,
                    isRepeat: false,
                    prefinalGrade: cells[4].innerText,
                    finalGrade: cells[5].innerText,
                };
                return studentData;
            });
        return { code, students, section };
    }


    const getCourseInfo = (row) => {
        const info = row.firstChild.innerText.split('\n');
        const yearAndTerm = /(\d{4})\/(\d)/.exec(info[0]);

        const codeAndSection = info[1].split('/');

        const year = yearAndTerm[1];
        const term = yearAndTerm[2];
        const code = codeAndSection[0].replace(' ', ' ');
        const section = codeAndSection[1];

        if (!year || !term || !code || !section) return null;

        return { code, section, year, term };
    };

    const downloadCourseDescription = async (year, code) => {
        const url = `https://pis.tiu.edu.iq/page/descriptions.php?yil=${year}&ders_kod=${code}&bol_no=1739`;

        let res = await fetch(url);
        let text = await res.text();
        // TODO: add error handling
        let sheet = document.createElement("div");
        sheet.innerHTML = text;

        const table = Array.from(sheet.querySelectorAll("td")).find((td) => td.innerText === "Course code:").parentElement
            .parentElement;

        const info = {};
        table.querySelectorAll("input,textarea").forEach((row) => (info[row.attributes.name.value] = row.value));

        return info;
    };

    // module.exports = async function() {
    async function namesDownloaderExamComittee () {
        console.log("loaded: names downloader");
        let buttonsContainer = Array.from(document.querySelectorAll("td"))
            .filter(td => td.innerText === 'Exam Committee Courses');
        if (buttonsContainer.length === 0) {
            console.log('could not find buttons container');
            return
        }
        buttonsContainer = buttonsContainer[0];

        const downloadNamesBtn = document.createElement("button");
        const downloadNamesNoRepeatBtn = document.createElement("button");
        const downloadNamesFromMinorsBtn = document.createElement("button");
        const downloadMakeupNamesBtn = document.createElement("button");
        const downloadCourseDescriptionBtn = document.createElement("button");

        downloadNamesBtn.innerText = "JSON";
        downloadNamesNoRepeatBtn.innerText = "JSON (no repeat)";
        downloadNamesFromMinorsBtn.innerText = "JSON (with final marks)";
        downloadMakeupNamesBtn.innerText = "JSON (makeup)";
        downloadCourseDescriptionBtn.innerText = "Course description (Text)";

        buttonsContainer.appendChild(downloadNamesBtn);
        buttonsContainer.appendChild(downloadNamesNoRepeatBtn);
        buttonsContainer.appendChild(downloadNamesFromMinorsBtn);
        buttonsContainer.appendChild(downloadMakeupNamesBtn);
        buttonsContainer.appendChild(downloadCourseDescriptionBtn);

        // const rows = document.querySelectorAll("#table_data > tbody > tr");

        let rows = Array.from(document.querySelectorAll('tr'))
            .filter(tr => tr.innerText.startsWith('2023/1 CE') || tr.innerText.startsWith('Exam Committee Courses'));

        const examComitteeRowIndex = rows.findIndex(r => r.innerText.startsWith('Exam Committee Courses'));
        rows = rows.slice(examComitteeRowIndex + 1);

        let courses = [];
        for (let row of rows) {
            const courseInfo = getCourseInfo(row);
            courses.push(courseInfo);
        }

        downloadNamesBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let allStudents = {};

            let studentsData = await Promise.all(
                courses.map(({ year, term, code, section }) => downloadNamesFromCourse(year, term, code, section))
            );
            studentsData.forEach(({ code, students }) => {
                if (!(code in allStudents)) {
                    allStudents[code] = [];
                }
                students.forEach((s) => allStudents[code].push(s));
            });

            let a = document.createElement("a");
            let file = new Blob([JSON.stringify(allStudents)], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `allStudents_${new Date().toISOString()}.json`;
            a.click();
        });

        downloadNamesNoRepeatBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let allStudents = {};

            let studentsData = await Promise.all(
                courses.map(({ year, term, code, section }) => downloadNamesFromCourse(year, term, code, section, true))
            );
            studentsData.forEach(({ code, students }) => {
                if (!(code in allStudents)) {
                    allStudents[code] = [];
                }
                students.forEach((s) => allStudents[code].push(s));
            });

            let a = document.createElement("a");
            let file = new Blob([JSON.stringify(allStudents)], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `allStudents_${new Date().toISOString()}.json`;
            a.click();
        });

        //todo refactor the callback
        downloadMakeupNamesBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let allStudents = {};

            let studentsData = await Promise.all(
                courses.map(({ code, section }) => downloadMakeupNamesFromCourse(year, term, code, section))
            );

            studentsData.forEach(({ code, students, section }) => {
                if (!(code in allStudents)) {
                    allStudents[code] = [];
                }
                students.forEach((s) => allStudents[code].push(s));
            });

            let a = document.createElement("a");
            let file = new Blob([JSON.stringify(allStudents)], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `allMakeupStudentsWithGrades_${new Date().toISOString()}.json`;
            a.click();
        });

        downloadNamesFromMinorsBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            let allStudents = {};

            let studentsData = await Promise.all(
                courses.map(({ code, section }) => downloadNamesFromCourseMinors(year, term, code, section))
            );
            studentsData.forEach(({ code, students }) => {
                if (!(code in allStudents)) {
                    allStudents[code] = [];
                }
                students.forEach((s) => allStudents[code].push(s));
            });

            let a = document.createElement("a");
            let file = new Blob([JSON.stringify(allStudents)], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `allStudentsWithFinalGrades_${new Date().toISOString()}.json`;
            a.click();
        });

        downloadCourseDescriptionBtn.addEventListener("click", async (e) => {
            //todo: refactor
            e.preventDefault();

            const seen = new Set();
            let result = "";
            let coursesInfo = await Promise.all(courses.map((course) => downloadCourseDescription(year, course.code)));
            coursesInfo = coursesInfo.sort((a, b) => a.ders_kod.localeCompare(b.ders_kod));

            for (const course of coursesInfo) {
                if (seen.has(course.ders_kod)) continue;

                seen.add(course.ders_kod);
                result += `Course code: ${course.ders_kod}\n`;
                result += `Course name: ${course.ders_adi}\n`;
                result += `Year: ${course.yil}\n`;
                result += `Department: -\n`;
                result += `Term: ${course.donem}\n`;
                result += `Teoric: ${course.teorik}\n`;
                result += `Practical: ${course.pratik}\n`;
                result += `Credit: ${course.kredi}\n`;
                result += `Reference: ${course.ref_kod}\n`;
                result += `Somestre: ${course.somestre}\n`;
                result += `Ects: ${course.ects}\n`;
                result += `Load: ${course.toplam_yuk}\n`;
                result += `Prerequisite: ${course.onc_ders_kod}\n`;
                result += `Category: ${course.kategori}\n`;
                result += `Description: ${course.aciklama}\n`;
                result += `================================================`;
                result += `\n\n`;
            }

            let a = document.createElement("a");
            let file = new Blob([result], {
                type: "text/plain",
            });
            a.href = URL.createObjectURL(file);
            a.download = `courseDescriptions_${new Date().toISOString()}.json`;
            a.click();
            console.log(result);
        });
    }

    class e{constructor(a,b,c,d,f){this._legacyCanvasSize=e.DEFAULT_CANVAS_SIZE;this._preferredCamera="environment";this._maxScansPerSecond=25;this._lastScanTimestamp=-1;this._destroyed=this._flashOn=this._paused=this._active=!1;this.$video=a;this.$canvas=document.createElement("canvas");c&&"object"===typeof c?this._onDecode=b:(c||d||f?console.warn("You're using a deprecated version of the QrScanner constructor which will be removed in the future"):console.warn("Note that the type of the scan result passed to onDecode will change in the future. To already switch to the new api today, you can pass returnDetailedScanResult: true."),
    this._legacyOnDecode=b);b="object"===typeof c?c:{};this._onDecodeError=b.onDecodeError||("function"===typeof c?c:this._onDecodeError);this._calculateScanRegion=b.calculateScanRegion||("function"===typeof d?d:this._calculateScanRegion);this._preferredCamera=b.preferredCamera||f||this._preferredCamera;this._legacyCanvasSize="number"===typeof c?c:"number"===typeof d?d:this._legacyCanvasSize;this._maxScansPerSecond=b.maxScansPerSecond||this._maxScansPerSecond;this._onPlay=this._onPlay.bind(this);this._onLoadedMetaData=
    this._onLoadedMetaData.bind(this);this._onVisibilityChange=this._onVisibilityChange.bind(this);this._updateOverlay=this._updateOverlay.bind(this);a.disablePictureInPicture=!0;a.playsInline=!0;a.muted=!0;let h=!1;a.hidden&&(a.hidden=!1,h=!0);document.body.contains(a)||(document.body.appendChild(a),h=!0);c=a.parentElement;if(b.highlightScanRegion||b.highlightCodeOutline){d=!!b.overlay;this.$overlay=b.overlay||document.createElement("div");f=this.$overlay.style;f.position="absolute";f.display="none";
    f.pointerEvents="none";this.$overlay.classList.add("scan-region-highlight");if(!d&&b.highlightScanRegion){this.$overlay.innerHTML='<svg class="scan-region-highlight-svg" viewBox="0 0 238 238" preserveAspectRatio="none" style="position:absolute;width:100%;height:100%;left:0;top:0;fill:none;stroke:#e9b213;stroke-width:4;stroke-linecap:round;stroke-linejoin:round"><path d="M31 2H10a8 8 0 0 0-8 8v21M207 2h21a8 8 0 0 1 8 8v21m0 176v21a8 8 0 0 1-8 8h-21m-176 0H10a8 8 0 0 1-8-8v-21"/></svg>';try{this.$overlay.firstElementChild.animate({transform:["scale(.98)",
    "scale(1.01)"]},{duration:400,iterations:Infinity,direction:"alternate",easing:"ease-in-out"});}catch(m){}c.insertBefore(this.$overlay,this.$video.nextSibling);}b.highlightCodeOutline&&(this.$overlay.insertAdjacentHTML("beforeend",'<svg class="code-outline-highlight" preserveAspectRatio="none" style="display:none;width:100%;height:100%;fill:none;stroke:#e9b213;stroke-width:5;stroke-dasharray:25;stroke-linecap:round;stroke-linejoin:round"><polygon/></svg>'),this.$codeOutlineHighlight=this.$overlay.lastElementChild);}this._scanRegion=
    this._calculateScanRegion(a);requestAnimationFrame(()=>{let m=window.getComputedStyle(a);"none"===m.display&&(a.style.setProperty("display","block","important"),h=!0);"visible"!==m.visibility&&(a.style.setProperty("visibility","visible","important"),h=!0);h&&(console.warn("QrScanner has overwritten the video hiding style to avoid Safari stopping the playback."),a.style.opacity="0",a.style.width="0",a.style.height="0",this.$overlay&&this.$overlay.parentElement&&this.$overlay.parentElement.removeChild(this.$overlay),
    delete this.$overlay,delete this.$codeOutlineHighlight);this.$overlay&&this._updateOverlay();});a.addEventListener("play",this._onPlay);a.addEventListener("loadedmetadata",this._onLoadedMetaData);document.addEventListener("visibilitychange",this._onVisibilityChange);window.addEventListener("resize",this._updateOverlay);this._qrEnginePromise=e.createQrEngine();}static set WORKER_PATH(a){console.warn("Setting QrScanner.WORKER_PATH is not required and not supported anymore. Have a look at the README for new setup instructions.");}static async hasCamera(){try{return !!(await e.listCameras(!1)).length}catch(a){return !1}}static async listCameras(a=
    !1){if(!navigator.mediaDevices)return [];let b=async()=>(await navigator.mediaDevices.enumerateDevices()).filter(d=>"videoinput"===d.kind),c;try{a&&(await b()).every(d=>!d.label)&&(c=await navigator.mediaDevices.getUserMedia({audio:!1,video:!0}));}catch(d){}try{return (await b()).map((d,f)=>({id:d.deviceId,label:d.label||(0===f?"Default Camera":`Camera ${f+1}`)}))}finally{c&&(console.warn("Call listCameras after successfully starting a QR scanner to avoid creating a temporary video stream"),e._stopVideoStream(c));}}async hasFlash(){let a;
    try{if(this.$video.srcObject){if(!(this.$video.srcObject instanceof MediaStream))return !1;a=this.$video.srcObject;}else a=(await this._getCameraStream()).stream;return "torch"in a.getVideoTracks()[0].getSettings()}catch(b){return !1}finally{a&&a!==this.$video.srcObject&&(console.warn("Call hasFlash after successfully starting the scanner to avoid creating a temporary video stream"),e._stopVideoStream(a));}}isFlashOn(){return this._flashOn}async toggleFlash(){this._flashOn?await this.turnFlashOff():await this.turnFlashOn();}async turnFlashOn(){if(!this._flashOn&&
    !this._destroyed&&(this._flashOn=!0,this._active&&!this._paused))try{if(!await this.hasFlash())throw "No flash available";await this.$video.srcObject.getVideoTracks()[0].applyConstraints({advanced:[{torch:!0}]});}catch(a){throw this._flashOn=!1,a;}}async turnFlashOff(){this._flashOn&&(this._flashOn=!1,await this._restartVideoStream());}destroy(){this.$video.removeEventListener("loadedmetadata",this._onLoadedMetaData);this.$video.removeEventListener("play",this._onPlay);document.removeEventListener("visibilitychange",
    this._onVisibilityChange);window.removeEventListener("resize",this._updateOverlay);this._destroyed=!0;this._flashOn=!1;this.stop();e._postWorkerMessage(this._qrEnginePromise,"close");}async start(){if(this._destroyed)throw Error("The QR scanner can not be started as it had been destroyed.");if(!this._active||this._paused)if("https:"!==window.location.protocol&&console.warn("The camera stream is only accessible if the page is transferred via https."),this._active=!0,!document.hidden)if(this._paused=
    !1,this.$video.srcObject)await this.$video.play();else try{let {stream:a,facingMode:b}=await this._getCameraStream();!this._active||this._paused?e._stopVideoStream(a):(this._setVideoMirror(b),this.$video.srcObject=a,await this.$video.play(),this._flashOn&&(this._flashOn=!1,this.turnFlashOn().catch(()=>{})));}catch(a){if(!this._paused)throw this._active=!1,a;}}stop(){this.pause();this._active=!1;}async pause(a=!1){this._paused=!0;if(!this._active)return !0;this.$video.pause();this.$overlay&&(this.$overlay.style.display=
    "none");let b=()=>{this.$video.srcObject instanceof MediaStream&&(e._stopVideoStream(this.$video.srcObject),this.$video.srcObject=null);};if(a)return b(),!0;await new Promise(c=>setTimeout(c,300));if(!this._paused)return !1;b();return !0}async setCamera(a){a!==this._preferredCamera&&(this._preferredCamera=a,await this._restartVideoStream());}static async scanImage(a,b,c,d,f=!1,h=!1){let m,n=!1;b&&("scanRegion"in b||"qrEngine"in b||"canvas"in b||"disallowCanvasResizing"in b||"alsoTryWithoutScanRegion"in
    b||"returnDetailedScanResult"in b)?(m=b.scanRegion,c=b.qrEngine,d=b.canvas,f=b.disallowCanvasResizing||!1,h=b.alsoTryWithoutScanRegion||!1,n=!0):b||c||d||f||h?console.warn("You're using a deprecated api for scanImage which will be removed in the future."):console.warn("Note that the return type of scanImage will change in the future. To already switch to the new api today, you can pass returnDetailedScanResult: true.");b=!!c;try{let p,k;[c,p]=await Promise.all([c||e.createQrEngine(),e._loadImage(a)]);
    [d,k]=e._drawToCanvas(p,m,d,f);let q;if(c instanceof Worker){let g=c;b||e._postWorkerMessageSync(g,"inversionMode","both");q=await new Promise((l,v)=>{let w,u,r,y=-1;u=t=>{t.data.id===y&&(g.removeEventListener("message",u),g.removeEventListener("error",r),clearTimeout(w),null!==t.data.data?l({data:t.data.data,cornerPoints:e._convertPoints(t.data.cornerPoints,m)}):v(e.NO_QR_CODE_FOUND));};r=t=>{g.removeEventListener("message",u);g.removeEventListener("error",r);clearTimeout(w);v("Scanner error: "+(t?
    t.message||t:"Unknown Error"));};g.addEventListener("message",u);g.addEventListener("error",r);w=setTimeout(()=>r("timeout"),1E4);let x=k.getImageData(0,0,d.width,d.height);y=e._postWorkerMessageSync(g,"decode",x,[x.data.buffer]);});}else q=await Promise.race([new Promise((g,l)=>window.setTimeout(()=>l("Scanner error: timeout"),1E4)),(async()=>{try{var [g]=await c.detect(d);if(!g)throw e.NO_QR_CODE_FOUND;return {data:g.rawValue,cornerPoints:e._convertPoints(g.cornerPoints,m)}}catch(l){g=l.message||l;
    if(/not implemented|service unavailable/.test(g))return e._disableBarcodeDetector=!0,e.scanImage(a,{scanRegion:m,canvas:d,disallowCanvasResizing:f,alsoTryWithoutScanRegion:h});throw `Scanner error: ${g}`;}})()]);return n?q:q.data}catch(p){if(!m||!h)throw p;let k=await e.scanImage(a,{qrEngine:c,canvas:d,disallowCanvasResizing:f});return n?k:k.data}finally{b||e._postWorkerMessage(c,"close");}}setGrayscaleWeights(a,b,c,d=!0){e._postWorkerMessage(this._qrEnginePromise,"grayscaleWeights",{red:a,green:b,
    blue:c,useIntegerApproximation:d});}setInversionMode(a){e._postWorkerMessage(this._qrEnginePromise,"inversionMode",a);}static async createQrEngine(a){a&&console.warn("Specifying a worker path is not required and not supported anymore.");return !e._disableBarcodeDetector&&"BarcodeDetector"in window&&BarcodeDetector.getSupportedFormats&&(await BarcodeDetector.getSupportedFormats()).includes("qr_code")?new BarcodeDetector({formats:["qr_code"]}):Promise.resolve().then(function () { return qrScannerWorker_min; }).then(b=>b.createWorker())}_onPlay(){this._scanRegion=
    this._calculateScanRegion(this.$video);this._updateOverlay();this.$overlay&&(this.$overlay.style.display="");this._scanFrame();}_onLoadedMetaData(){this._scanRegion=this._calculateScanRegion(this.$video);this._updateOverlay();}_onVisibilityChange(){document.hidden?this.pause():this._active&&this.start();}_calculateScanRegion(a){let b=Math.round(2/3*Math.min(a.videoWidth,a.videoHeight));return {x:Math.round((a.videoWidth-b)/2),y:Math.round((a.videoHeight-b)/2),width:b,height:b,downScaledWidth:this._legacyCanvasSize,
    downScaledHeight:this._legacyCanvasSize}}_updateOverlay(){requestAnimationFrame(()=>{if(this.$overlay){var a=this.$video,b=a.videoWidth,c=a.videoHeight,d=a.offsetWidth,f=a.offsetHeight,h=a.offsetLeft,m=a.offsetTop,n=window.getComputedStyle(a),p=n.objectFit,k=b/c,q=d/f;switch(p){case "none":var g=b;var l=c;break;case "fill":g=d;l=f;break;default:("cover"===p?k>q:k<q)?(l=f,g=l*k):(g=d,l=g/k),"scale-down"===p&&(g=Math.min(g,b),l=Math.min(l,c));}var [v,w]=n.objectPosition.split(" ").map((r,y)=>{const x=
    parseFloat(r);return r.endsWith("%")?(y?f-l:d-g)*x/100:x});n=this._scanRegion.width||b;q=this._scanRegion.height||c;p=this._scanRegion.x||0;var u=this._scanRegion.y||0;k=this.$overlay.style;k.width=`${n/b*g}px`;k.height=`${q/c*l}px`;k.top=`${m+w+u/c*l}px`;c=/scaleX\(-1\)/.test(a.style.transform);k.left=`${h+(c?d-v-g:v)+(c?b-p-n:p)/b*g}px`;k.transform=a.style.transform;}});}static _convertPoints(a,b){if(!b)return a;let c=b.x||0,d=b.y||0,f=b.width&&b.downScaledWidth?b.width/b.downScaledWidth:1;b=b.height&&
    b.downScaledHeight?b.height/b.downScaledHeight:1;for(let h of a)h.x=h.x*f+c,h.y=h.y*b+d;return a}_scanFrame(){!this._active||this.$video.paused||this.$video.ended||("requestVideoFrameCallback"in this.$video?this.$video.requestVideoFrameCallback.bind(this.$video):requestAnimationFrame)(async()=>{if(!(1>=this.$video.readyState)){var a=Date.now()-this._lastScanTimestamp,b=1E3/this._maxScansPerSecond;a<b&&await new Promise(d=>setTimeout(d,b-a));this._lastScanTimestamp=Date.now();try{var c=await e.scanImage(this.$video,
    {scanRegion:this._scanRegion,qrEngine:this._qrEnginePromise,canvas:this.$canvas});}catch(d){if(!this._active)return;this._onDecodeError(d);}!e._disableBarcodeDetector||await this._qrEnginePromise instanceof Worker||(this._qrEnginePromise=e.createQrEngine());c?(this._onDecode?this._onDecode(c):this._legacyOnDecode&&this._legacyOnDecode(c.data),this.$codeOutlineHighlight&&(clearTimeout(this._codeOutlineHighlightRemovalTimeout),this._codeOutlineHighlightRemovalTimeout=void 0,this.$codeOutlineHighlight.setAttribute("viewBox",
`${this._scanRegion.x||0} `    +`${this._scanRegion.y||0} `+`${this._scanRegion.width||this.$video.videoWidth} `+`${this._scanRegion.height||this.$video.videoHeight}`),this.$codeOutlineHighlight.firstElementChild.setAttribute("points",c.cornerPoints.map(({x:d,y:f})=>`${d},${f}`).join(" ")),this.$codeOutlineHighlight.style.display="")):this.$codeOutlineHighlight&&!this._codeOutlineHighlightRemovalTimeout&&(this._codeOutlineHighlightRemovalTimeout=setTimeout(()=>this.$codeOutlineHighlight.style.display=
    "none",100));}this._scanFrame();});}_onDecodeError(a){a!==e.NO_QR_CODE_FOUND&&console.log(a);}async _getCameraStream(){if(!navigator.mediaDevices)throw "Camera not found.";let a=/^(environment|user)$/.test(this._preferredCamera)?"facingMode":"deviceId",b=[{width:{min:1024}},{width:{min:768}},{}],c=b.map(d=>Object.assign({},d,{[a]:{exact:this._preferredCamera}}));for(let d of [...c,...b])try{let f=await navigator.mediaDevices.getUserMedia({video:d,audio:!1}),h=this._getFacingMode(f)||(d.facingMode?this._preferredCamera:
    "environment"===this._preferredCamera?"user":"environment");return {stream:f,facingMode:h}}catch(f){}throw "Camera not found.";}async _restartVideoStream(){let a=this._paused;await this.pause(!0)&&!a&&this._active&&await this.start();}static _stopVideoStream(a){for(let b of a.getTracks())b.stop(),a.removeTrack(b);}_setVideoMirror(a){this.$video.style.transform="scaleX("+("user"===a?-1:1)+")";}_getFacingMode(a){return (a=a.getVideoTracks()[0])?/rear|back|environment/i.test(a.label)?"environment":/front|user|face/i.test(a.label)?
    "user":null:null}static _drawToCanvas(a,b,c,d=!1){c=c||document.createElement("canvas");let f=b&&b.x?b.x:0,h=b&&b.y?b.y:0,m=b&&b.width?b.width:a.videoWidth||a.width,n=b&&b.height?b.height:a.videoHeight||a.height;d||(d=b&&b.downScaledWidth?b.downScaledWidth:m,b=b&&b.downScaledHeight?b.downScaledHeight:n,c.width!==d&&(c.width=d),c.height!==b&&(c.height=b));b=c.getContext("2d",{alpha:!1});b.imageSmoothingEnabled=!1;b.drawImage(a,f,h,m,n,0,0,c.width,c.height);return [c,b]}static async _loadImage(a){if(a instanceof
    Image)return await e._awaitImageLoad(a),a;if(a instanceof HTMLVideoElement||a instanceof HTMLCanvasElement||a instanceof SVGImageElement||"OffscreenCanvas"in window&&a instanceof OffscreenCanvas||"ImageBitmap"in window&&a instanceof ImageBitmap)return a;if(a instanceof File||a instanceof Blob||a instanceof URL||"string"===typeof a){let b=new Image;b.src=a instanceof File||a instanceof Blob?URL.createObjectURL(a):a.toString();try{return await e._awaitImageLoad(b),b}finally{(a instanceof File||a instanceof
    Blob)&&URL.revokeObjectURL(b.src);}}else throw "Unsupported image type.";}static async _awaitImageLoad(a){a.complete&&0!==a.naturalWidth||await new Promise((b,c)=>{let d=f=>{a.removeEventListener("load",d);a.removeEventListener("error",d);f instanceof ErrorEvent?c("Image load error"):b();};a.addEventListener("load",d);a.addEventListener("error",d);});}static async _postWorkerMessage(a,b,c,d){return e._postWorkerMessageSync(await a,b,c,d)}static _postWorkerMessageSync(a,b,c,d){if(!(a instanceof Worker))return -1;
    let f=e._workerMessageId++;a.postMessage({id:f,type:b,data:c},d);return f}}e.DEFAULT_CANVAS_SIZE=400;e.NO_QR_CODE_FOUND="No QR code found";e._disableBarcodeDetector=!1;e._workerMessageId=0;

    var robotoMonoB64 = 'data:application/octet-stream;base64,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/+sBWf//AIf/7ATgBq0CJgAgAAAABgJM7Bj////yAAAENAfdAiYABgAAAAcCS//iAUj////z/+wERQacAiYAIAAAAAYCS+MH//8AtgAABLIIBAImAAYAAAAHAkr/+AE1//8Ah//sBLMGxAImACAAAAAGAkr59f//ALYAAAQ0CC8CJgAGAAAABwJJ/+kBNv//AIf/7ARFBu8CJgAgAAAABgJJ6vb//wC2/rIENAdIAiYABgAAACcBXAB9AVsABwFlBNIACv//AIf+qARFBgcCJgAgAAAAJgFcfhoABwFlBOMAAP//AK4AAAQeB8YCJgAKAAAABwF2BIoBUv//AMsAAARVBnACJgFtAAAABwF2BO3//P//AK7+sgQeBbACJgAKAAAABwFlBJ4ACv//AMv+sgRVBcMCJgAkAAAABwFlBQYACv//AGr+oARhBcQCJgAQAAAABwFlBN//+P//AHr+nwRSBE4CJgAqAAAABwFlBM3/9///AGr/7ARhB9sCJgAQAAAABwF2BMwBZ///AHr/7ARSBoQCJgAqAAAABwF2BLkAEP//AGr/7ATtCAMCJgAQAAAABwJM//kBbv//AHr/7ATaBqwCJgAqAAAABgJM5hf//wAA/+wEYQfyAiYAEAAAAAcCS//wAV3////t/+wEUgabAiYAKgAAAAYCS90G//8Aav/sBL8IGQImABAAAAAHAkoABQFK//8Aev/sBK0GwwImACoAAAAGAkrz9P//AGr/7ARhCEQCJgAQAAAABwJJ//cBS///AHr/7ARSBu4CJgAqAAAABgJJ5PX//wBq/qAEYQddAiYAEAAAACcBXACLAXAABwFlBN//+P//AHr+nwRSBgYCJgAqAAAAJgFceBkABwFlBM3/9///AGP/7ATGByACJgDYAAAABwFbAIQBV///AHf/7ASuBd4CJgE1AAAABgFbfBX//wBj/+wExgcjAiYA2AAAAAcBWv+YAVr//wB3/+wErgXhAiYBNQAAAAYBWpAY//8AY//sBMYHxgImANgAAAAHAXYExwFS//8Ad//sBK4GhAImATUAAAAHAXYEvwAQ//8AY//sBMYHUgImANgAAAAHAV0AkgFh//8Ad//sBK4GEAImATUAAAAHAV0AigAf//8AY/6oBMYF+gImANgAAAAHAWUE0wAA//8Ad/6fBK4EqgImATUAAAAHAWUEy//3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e2V7cXt9e4l7lXuhe6x7tHu8e8R7zHvUe9x75Hvse/R7/HwEfAx8FHwcfCh8NHw/fEp8VXxgfGt8c3x7fIN8i3yTfJ58qXy0fL98ynzWfOJ9Wn1ifW59dn1+fYp9ln2efaZ9rn22fcJ9yn3Sfdp94n3qffJ9+n4Cfgp+En4afiV+LX41foN+i36Tfp5+qX6xfrl+xH7Mftd+4n7vfvp/An8Ofxp/JX8wfzx/SH9Uf19/a39zf3t/h3+Tf55/qX+0f79/x3/Pf9d/43/uf/aAAoANgBmAJIAsgDSAQIBLgFeAX4BqgHaAgYCNgJiApICvgLuAxoDSgN2A5YDtgPmBBIEQgRuBJ4EygT6BSYFVgWGBbYF4gYSBj4GbgaeBr4G7gceB04HfgeuB94IDgg6CGoIlgjGCPIJIglOCY4Jzgn+CioKWgqGCrYK4gsSCz4Lfgu6C+oMGgxKDHoMqgzaDQoNNg1mDZINwg3uDh4OSg6KDsYO9g8mD1YPhg+2D+YQFhBGEHYQohDSEP4RLhFaEYoRthH2EjISYhKOEr4S6hMaE0oTehOqE9oUChQ6FGoUmhTKFPoVJhVWFYIVshXiFhIWQhZyFqIW0hcCFzIXYheSF8IX/hguGF4Yjhi+GO4ZHhlOGX4ZrhneGg4aPhpuGp4azhr+Gy4bXht+HHIdZh5aHsIfKh/CIFIgkiDOIP4hLiFeIY4hviHuIn4jBiOiJD4kXiSQAAQAAAAMAABrgKh5fDzz1AAsIAAAAAADE8BEuAAAAANrYP6v8Bf3VBkcIYgAAAAkAAgAAAAAAAATNAAAAAABRAKwAawCbALYAvwBkAI0ArgBiAKwAxgCUAI8AagC/AF4AtQB2AEwAiwBHAEkAVwA9AHIAnACvAI8AiwCHAJgAjACuAMsA0wCwAMsAXQCuAHoArQCMAUkArwCOALQAYgAwAG4ARACgAJEA0ABVAF4ASwC7AI0AcACxAJUBggE8AUMBHAEQACQAMAAmACAAKwBPAC4ASQCoAK0AugCpALEAogCTAHEAIQCgABEAaQB/AGcB5gHyAL8AzAFiAfACIgHmAQkB+AGaAJsA2gBKAE8B7gFiAewBzQG8AUkBLQEvAe4BYgFlAUABqgGVAUMBQwGMAYwAdwCpAJwAtQBzAK0AqQCNAKoAsgC7AMIAvQD8AOcBKwAsADYCHAH/AHcAeQBaAFcAZwFpAKAAPQBrAEAAVwDTAOcAMABRAFEAUQBRAFEAUQBRAFEAUQBRACAAawBrAGsAawCb/8UAtgC2ALYAtgC2ALYAtgC2AK8Atv/FAGQAZABkABgAjQCuAK4ArgCuAK4ArgCuAK4ArgBiAKwAxgDGAMYAxgA6AI8AjwCPAI8AagBqAGoAagBqAGMAagBqAEcARwBqALUAtQC1AHYAdgB2AHYATABMAIsAiwCLAIsAiwCLAIsAiwCLAIsAiwBJAEkASQBJAD0APQA9AD0AcgByAHIAnACcAJwAnACcAJwAnACcAJwAnAArAI8AjwCPAI8AZAB8AIcAhwCHAIcAhwCHAIcAhwC4AIcAjACMAIwAC//nAMsAywDLAMsAywDLAMsAywCwALAAywCZAMsAhQDLAK4ArgCuAK4AegB6AHoAegB6AHcAegB6AHoAegB6AUkBFAEQAK8ArwCvAK8AjgB/ALQAtAC0ALQAtAC0ALQAtAC0ALQAtAAwADAAMAAwAEQARABEAEQAoACgAKABnwGaAMEAigEBATsB8gEfAZoA9gEw/ScBzQGOAS4AAADUALwA8QDLAIAAUAHIALABrfzK/Wj8iP1Z/AUCKQETAjAAtQAuAGoANgCRAKIAcABFAGUAYQCBAK4ARwB4AIsAdQCkALkAuAA5AK8AWQClAHgAbQCtAJ4AbgBhAE8AmAA2AC4AKgCBAB4AgwBDAKIAogBGAB0AWQCiAC8AKwCmAKsAfQB9ADIAkACoAHIAdwBBAIEApAC3ADYAEQCHAKUApAA3AIkApQClAGgAegCqAI0AgQB2ADkAkAClAIEAcQBP/+kAjwAmAIIAHAClAGsAXwAcAH0AmwAnAFcAcQBwAFUAaQBQAFEAygDeAGMAXQAaAFEARQA3AGoAegBNAGcAcQBfAJcAvwB2ANEA/AHDAjz+q/60AL8ArQC2ALYAuQC4AK4AowAtADgAcgBuAG0AdABoAFwAOQA0AKsAkgDjACYAJgDIALQAtgCzAFoAlACJAEIAdABhAE0AZQA3AFAAswDQABQALwBvAHUAjgCgAEwASQBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKYBzwFcAQ8BSwB/AEkA3QB5AJkAUAAzACQAQQB+AKcAMwA5ADUA+ACOAAAAXAAPAREA/AAQAQsBPgH5ADYA0ABuALcAyADn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AJwAZgFaAHgAjgB5AJ0CcwBcAFMAVABaAFUAjwCaAWEAkgBDAWoAiAJ0AJMBXgCVAH4AQQBCAVsBawCbAGQBZgBAAEQBbABGAEUARwBeAKIAngCgAKcAoQClAEgAqwC1AK8AsgCzAMQAvwDBAMIAuQDSANcA0wDVAN0A1gB/ANsA6wDnAOkA6gD2AE0AUAEBAP0A/wEGAQABBABJAQoBFAEOAREBEgEhAR0BHwEgAEwBLwE0ATABMgE6ATMAgAE4AUgBRAFGAUcBUwBOAVUAowECAJ8A/gCkAQMAqQEIAKwBCwJ1AnYAqgEJAK0BDACuAQ0AtgEVALABDwC0ARMAuAEXALEBEAC7ARkAugEYAncCeAC8ARoAvgEcAL0BGwDHASQAxQEiAMABHgDGASMAwwFtAW4BbwDIASUAyQEmAE8AygEnAMwBKQDLASgAzQEqAM4BKwDPASwA0QEuANABLQJ5ALcBFgDaATcA1AExANkBNgBKAEsA3gE7AOABPQDfATwA4QE+AOQBQQDjAUAA4gE/An4CgADmAUMA5QFCAPEBTgDuAUsA6AFFAPABTQDtAUoA7wFMAPMBUAD3AVQA+AD6AVcA/AFZAPsBWAFwANgBNQDsAUkApgEFAKgBBwDcATkBXAFkAV8BYAFiAWcBXQFjAXgBeQLUAXoC1QLWAtcBewF8At4C3wLgAX0C4QLiAX4C4wLkAX8C5QGAAuYBgQLnAugBggLpAYMBhALqAusC7ALtAu4C7wLwAvEBjgLzAvQBjwLyAZABkQGSAZMBlAGVAZYC9QGXAZgDKgL7AZwC/AGdAv0C/gL/AwABngGfAaADAgMrAwMBoQMEAaIDBQMGAaMDBwGkAaUBpgMIAwEBpwMJAwoDCwMMAw0DDgMPAagDEAMRAxIBswG0AbUBtgMTAbcBuAG5AxQBugG7AbwBvQMVAb4DFgMXAb8DGAHAAxkDLAMaAcsDGwHMAxwDHQMeAx8BzQHOAc8DIAMtAyEB0AHRAdID1AMuAy8B4AHhAeIB4wMwAzEB8wH0A9kD2gPTA9IB9QH2AfcB+APVA9YB+QH6A80DzgMyAzMDvwPAAfsB/APXA9gB/QH+A8EDwgH/AgACAQICAgMCBAM0AzUDwwPEAzYDNwPhA+IDxQPGAgUCBgPHA8gCBwIIAgkD0QIKAgsDzwPQAzgDOQM6AgwCDQPfA+ACDgIPA9sD3APJA8oD3QPeAhADRQNEA0YDRwNIA0kDSgIRAhIDywPMA18DYAITAhQDYQNiA+MD5AIVA2MD5QNkA2UA9QFSAPIBTwD0AVEA+QFWAGgAaQPmAjEAbABtAG4CMgBvAHAAcQCQAJEAZQIzAGMDvgI2AkEAfbgB/4WwBI0AAAAAHwF6AAMAAQQJAAAAtAAAAAMAAQQJAAEAFgC0AAMAAQQJAAIADgDKAAMAAQQJAAMAOgDYAAMAAQQJAAQAJgESAAMAAQQJAAUAGgE4AAMAAQQJAAYAJAFSAAMAAQQJAAcASgF2AAMAAQQJAAkADAHAAAMAAQQJAAsAFAHMAAMAAQQJAAwAJgHgAAMAAQQJAA0AXAIGAAMAAQQJAA4AVAJiAAMAAQQJAQAADAK2AAMAAQQJAQEACALCAAMAAQQJAQIAHgLKAAMAAQQJAQMACgLoAAMAAQQJAQQAIALyAAMAAQQJAQUADgDKAAMAAQQJAQYAJAFSAAMAAQQJAQcADAMSAAMAAQQJAQgAIgMeAAMAAQQJAQkACANAAAMAAQQJAQoAHgNIAAMAAQQJAQsADANmAAMAAQQJAQwACALCAAMAAQQJAQ0ACgLoAAMAAQQJAQ4ADgDKAAMAAQQJAQ8ADAMSAAMAAQQJARAACANAAAMAAQQJAREADANyAEMAbwBwAHkAcgBpAGcAaAB0ACAAMgAwADEANQAgAFQAaABlACAAUgBvAGIAbwB0AG8AIABNAG8AbgBvACAAUAByAG8AagBlAGMAdAAgAEEAdQB0AGgAbwByAHMAIAAoAGgAdAB0AHAAcwA6AC8ALwBnAGkAdABoAHUAYgAuAGMAbwBtAC8AZwBvAG8AZwBsAGUAZgBvAG4AdABzAC8AcgBvAGIAbwB0AG8AbQBvAG4AbwApAFIAbwBiAG8AdABvACAATQBvAG4AbwBSAGUAZwB1AGwAYQByADMALgAwADAAMAA7AEcATwBPAEcAOwBSAG8AYgBvAHQAbwBNAG8AbgBvAC0AUgBlAGcAdQBsAGEAcgBSAG8AYgBvAHQAbwAgAE0AbwBuAG8AIABSAGUAZwB1AGwAYQByAFYAZQByAHMAaQBvAG4AIAAzAC4AMAAwADAAUgBvAGIAbwB0AG8ATQBvAG4AbwAtAFIAZQBnAHUAbABhAHIAUgBvAGIAbwB0AG8AIABNAG8AbgBvACAAaQBzACAAYQAgAHQAcgBhAGQAZQBtAGEAcgBrACAAbwBmACAARwBvAG8AZwBsAGUALgBHAG8AbwBnAGwAZQBHAG8AbwBnAGwAZQAuAGMAbwBtAEMAaAByAGkAcwB0AGkAYQBuACAAUgBvAGIAZQByAHQAcwBvAG4ATABpAGMAZQBuAHMAZQBkACAAdQBuAGQAZQByACAAdABoAGUAIABBAHAAYQBjAGgAZQAgAEwAaQBjAGUAbgBzAGUALAAgAFYAZQByAHMAaQBvAG4AIAAyAC4AMABoAHQAdABwADoALwAvAHcAdwB3AC4AYQBwAGEAYwBoAGUALgBvAHIAZwAvAGwAaQBjAGUAbgBzAGUAcwAvAEwASQBDAEUATgBTAEUALQAyAC4AMABXAGUAaQBnAGgAdABUAGgAaQBuAFIAbwBiAG8AdABvAE0AbwBuAG8ALQBUAGgAaQBuAEwAaQBnAGgAdABSAG8AYgBvAHQAbwBNAG8AbgBvAC0ATABpAGcAaAB0AE0AZQBkAGkAdQBtAFIAbwBiAG8AdABvAE0AbwBuAG8ALQBNAGUAZABpAHUAbQBCAG8AbABkAFIAbwBiAG8AdABvAE0AbwBuAG8ALQBCAG8AbABkAEkAdABhAGwAaQBjAE4AbwByAG0AYQBsAAIAAAAAAAD/agBkAAAAAQAAAAAAAAAAAAAAAAAAAAAD5wAAAAMAJAAlACYAJwAoACkAKgArACwALQAuAC8AMAAxADIAMwA0ADUANgA3ADgAOQA6ADsAPAA9AEQARQBGAEcASABJAEoASwBMAE0ATgBPAFAAUQBSAFMAVABVAFYAVwBYAFkAWgBbAFwAXQATABQAFQAWABcAGAAZABoAGwAcAPEA8gDzAJ0AngD0APUA9gCQAKAAsACxAOoA7QDuAQIAiQEDAAcAhACFAJYApgD3AQQBBQC9AAQAowAiAKIADwARAB0AHgCrAMMAhwBCABAAsgCzAAoABQC2ALcAxAC0ALUAxQEGAQcACwAMAD4AQABeAGAAvgC/AA4A7wCTAPAAuAAgAI8ApwAfACEAlACVAKQAEgA/ALwACADGAF8A6ACCAMIAiwCKAIwAgwANAAYACQAjAIYAiABBAGEAyQEIAMcAYgCtAQkBCgBjAQsArgEMAP0A/wBkAQ0BDgEPAGUBEAERAMgAygESAMsBEwEUARUA6QD4ARYBFwEYARkAzAEaAM0AzgD6AM8BGwEcAR0BHgEfASABIQEiASMA4gEkASUBJgBmANABJwDRAGcA0wEoASkBKgCRASsArwEsAS0BLgEvAOQA+wEwATEBMgDUATMA1QBoANYBNAE1ATYBNwE4ATkBOgE7ATwBPQDrAT4AuwE/AUAA5gFBAGkBQgBrAGwAagFDAUQAbgFFAG0BRgD+AQAAbwFHAUgBAQBwAUkBSgByAHMBSwBxAUwBTQFOAPkBTwFQAVEBUgB0AVMAdgB3AHUBVAFVAVYBVwFYAVkBWgFbAVwA4wFdAV4BXwB4AHkBYAB7AHwAegFhAWIBYwChAWQAfQFlAWYBZwFoAOUA/AFpAWoBawB+AWwAgACBAH8BbQFuAW8BcAFxAXIBcwF0AXUBdgDsAXcAugF4AXkA5wF6AEMAjQDYANkA2gDbANwAjgDdAN8A4QF7AN4A4AF8AAIAqQCXAKoA1wF9AX4BfwGAAYEBggGDAYQBhQGGAYcBiAGJAYoAqAGLAYwBjQGOAY8BkAGRAJ8BkgGTAZQBlQGWAZcBmAGZAZoBmwGcAJsBnQGeAZ8BoAGhAaIBowGkAaUBpgGnAagBqQGqAasBrAGtAa4BrwGwAbEBsgGzAbQBtQG2AbcBuAG5AboBuwG8Ab0BvgG/AcABwQHCAcMBxAHFAcYBxwHIAckBygHLAcwBzQHOAc8B0AHRAdIB0wHUAdUB1gHXAdgB2QHaAdsB3AHdAd4B3wHgAeEB4gHjAeQB5QHmAecB6AHpAeoB6wHsAe0B7gHvAfAB8QHyAfMB9AH1AfYB9wH4AfkB+gH7AfwB/QH+Af8CAAIBAgICAwIEAgUCBgIHAggCCQIKAgsCDAINAg4CDwIQAhECEgITAhQCFQIWAhcCGAIZAhoCGwIcAh0CHgIfAiACIQIiAiMCJAIlAiYCJwIoAikCKgIrAiwCLQIuAi8CMAIxAjICMwI0AjUCNgI3AjgCOQI6AjsCPAI9Aj4CPwJAAkECQgJDAkQCRQJGAkcCSAJJAkoAmACaAJkApQCSAJwAuQJLAkwCTQJOAk8CUAJRAlICUwJUAlUCVgJXAlgCWQJaAlsCXAJdAl4CXwJgAmECYgJjAmQCZQJmAmcCaAJpAmoCawJsAm0CbgJvAnACcQJyAnMCdAJ1AnYCdwCsAngCeQJ6AnsCfAJ9An4CfwKAAoECggKDAoQChQKGAocCiAKJAooCiwKMAo0CjgKPApACkQKSApMClAKVApYClwKYApkCmgKbApwCnQKeAp8CoAKhAqICowKkAqUCpgKnAqgCqQKqAqsCrAKtAq4CrwKwArECsgKzArQCtQK2ArcCuAK5AroCuwK8Ar0CvgK/AsACwQLCAsMCxALFAsYCxwLIAskCygLLAswCzQLOAs8C0ALRAtIC0wLUAtUC1gLXAtgC2QLaAtsC3ALdAt4C3wLgAuEC4gLjAuQC5QLmAucC6ALpAuoC6wLsAu0C7gLvAvAC8QLyAvMC9AL1AvYC9wL4AvkC+gL7AvwC/QL+Av8DAAMBAwIDAwMEAwUDBgMHAwgDCQMKAwsDDAMNAw4DDwMQAxEDEgMTAxQDFQMWAxcDGAMZAxoDGwMcAx0DHgMfAyADIQMiAyMDJAMlAyYDJwMoAykDKgMrAywDLQMuAy8DMAMxAzIDMwM0AzUDNgM3AzgDOQM6AzsDPAM9Az4DPwNAA0EDQgNDA0QDRQNGA0cDSANJA0oDSwNMA00DTgNPA1ADUQNSA1MDVANVA1YDVwNYA1kDWgNbA1wDXQNeA18DYANhA2IDYwNkA2UDZgNnA2gDaQNqA2sDbANtA24DbwNwA3EDcgNzA3QDdQN2A3cDeAN5A3oDewN8A30DfgN/A4ADgQOCA4MDhAOFA4YDhwOIA4kDigOLA4wDjQOOA48DkAORA5IDkwOUA5UDlgOXA5gDmQOaA5sDnAOdA54DnwOgA6EDogOjA6QDpQOmA6cDqAOpA6oDqwOsA60DrgOvA7ADsQOyA7MDtAO1A7YDtwO4A7kDugO7A7wDvQO+A78DwAPBA8IDwwPEA8UDxgPHA8gDyQPKA8sDzAPNA84DzwPQA9ED0gPTA9QD1QPWA9cD2APZA9oD2wPcA90D3gPfA+AD4QPiA+MD5APlA+YD5wPoA+kD6gxrZ3JlZW5sYW5kaWMFc2Nod2EEbGlyYQZwZXNldGEGbWludXRlBnNlY29uZAZBYnJldmUHQW1hY3JvbgdBb2dvbmVrCkFyaW5nYWN1dGUHQUVhY3V0ZQtDY2lyY3VtZmxleAZEY2Fyb24GRGNyb2F0BkVicmV2ZQZFY2Fyb24KRWRvdGFjY2VudAdFbWFjcm9uA0VuZwdFb2dvbmVrC0djaXJjdW1mbGV4DEdjb21tYWFjY2VudARIYmFyC0hjaXJjdW1mbGV4BklicmV2ZQdJbWFjcm9uB0lvZ29uZWsGSXRpbGRlC0pjaXJjdW1mbGV4DEtjb21tYWFjY2VudAZMYWN1dGUGTGNhcm9uDExjb21tYWFjY2VudARMZG90Bk5hY3V0ZQZOY2Fyb24MTmNvbW1hYWNjZW50Bk9icmV2ZQVPaG9ybg1PaHVuZ2FydW1sYXV0B09tYWNyb24LT3NsYXNoYWN1dGUGUmFjdXRlBlJjYXJvbgxSY29tbWFhY2NlbnQGU2FjdXRlC1NjaXJjdW1mbGV4BFRiYXIGVGNhcm9uBlVicmV2ZQVVaG9ybg1VaHVuZ2FydW1sYXV0B1VtYWNyb24HVW9nb25lawVVcmluZwZVdGlsZGUGV2FjdXRlC1djaXJjdW1mbGV4CVdkaWVyZXNpcwZXZ3JhdmULWWNpcmN1bWZsZXgGWWdyYXZlBlphY3V0ZQpaZG90YWNjZW50BmFicmV2ZQdhbWFjcm9uB2FvZ29uZWsKYXJpbmdhY3V0ZQdhZWFjdXRlC2NjaXJjdW1mbGV4BmRjYXJvbgZlYnJldmUGZWNhcm9uCmVkb3RhY2NlbnQHZW1hY3JvbgNlbmcHZW9nb25lawtnY2lyY3VtZmxleAxnY29tbWFhY2NlbnQEaGJhcgtoY2lyY3VtZmxleAZpYnJldmUHaW1hY3Jvbgdpb2dvbmVrBml0aWxkZQtqY2lyY3VtZmxleAxrY29tbWFhY2NlbnQGbGFjdXRlBmxjYXJvbgxsY29tbWFhY2NlbnQEbGRvdAZuYWN1dGUGbmNhcm9uDG5jb21tYWFjY2VudAZvYnJldmUFb2hvcm4Nb2h1bmdhcnVtbGF1dAdvbWFjcm9uC29zbGFzaGFjdXRlBnJhY3V0ZQZyY2Fyb24McmNvbW1hYWNjZW50BnNhY3V0ZQtzY2lyY3VtZmxleAR0YmFyBnRjYXJvbgZ1YnJldmUFdWhvcm4NdWh1bmdhcnVtbGF1dAd1bWFjcm9uB3VvZ29uZWsFdXJpbmcGdXRpbGRlBndhY3V0ZQt3Y2lyY3VtZmxleAl3ZGllcmVzaXMGd2dyYXZlC3ljaXJjdW1mbGV4BnlncmF2ZQZ6YWN1dGUKemRvdGFjY2VudAhkb3RiZWxvdwtjb21tYWFjY2VudAJJSgJpagVsb25ncwd1bmkwMjM3B3VuaTAyRjMJZ3JhdmVjb21iCWFjdXRlY29tYgl0aWxkZWNvbWIEaG9vawd1bmkwMzBGBXRvbm9zDWRpZXJlc2lzdG9ub3MJYW5vdGVsZWlhBUdhbW1hBVRoZXRhBkxhbWJkYQJYaQJQaQVTaWdtYQNQaGkDUHNpBWFscGhhBGJldGEFZ2FtbWEFZGVsdGEHZXBzaWxvbgR6ZXRhA2V0YQV0aGV0YQRpb3RhBmxhbWJkYQJ4aQNyaG8Gc2lnbWExBXNpZ21hA3RhdQd1cHNpbG9uA3BoaQNwc2kFb21lZ2EHdW5pMDNEMQd1bmkwM0QyB3VuaTAzRDYHdW5pMDQwMgd1bmkwNDA0B3VuaTA0MDkHdW5pMDQwQQd1bmkwNDBCB3VuaTA0MEYHdW5pMDQxMQd1bmkwNDE0B3VuaTA0MTYHdW5pMDQxNwd1bmkwNDE4B3VuaTA0MUIHdW5pMDQyMwd1bmkwNDI2B3VuaTA0MjcHdW5pMDQyOAd1bmkwNDI5B3VuaTA0MkEHdW5pMDQyQgd1bmkwNDJDB3VuaTA0MkQHdW5pMDQyRQd1bmkwNDJGB3VuaTA0MzEHdW5pMDQzMgd1bmkwNDMzB3VuaTA0MzQHdW5pMDQzNgd1bmkwNDM3B3VuaTA0MzgHdW5pMDQzQQd1bmkwNDNCB3VuaTA0M0MHdW5pMDQzRAd1bmkwNDNGB3VuaTA0NDIHdW5pMDQ0NAd1bmkwNDQ2B3VuaTA0NDcHdW5pMDQ0OAd1bmkwNDQ5B3VuaTA0NEEHdW5pMDQ0Qgd1bmkwNDRDB3VuaTA0NEQHdW5pMDQ0RQd1bmkwNDRGB3VuaTA0NTIHdW5pMDQ1NAd1bmkwNDU5B3VuaTA0NUEHdW5pMDQ1Qgd1bmkwNDVGB3VuaTA0NjAHdW5pMDQ2MQd1bmkwNDYzB3VuaTA0NjQHdW5pMDQ2NQd1bmkwNDY2B3VuaTA0NjcHdW5pMDQ2OAd1bmkwNDY5B3VuaTA0NkEHdW5pMDQ2Qgd1bmkwNDZDB3VuaTA0NkQHdW5pMDQ2RQd1bmkwNDZGB3VuaTA0NzIHdW5pMDQ3Mwd1bmkwNDc0B3VuaTA0NzUHdW5pMDQ3OAd1bmkwNDc5B3VuaTA0N0EHdW5pMDQ3Qgd1bmkwNDdDB3VuaTA0N0QHdW5pMDQ3RQd1bmkwNDdGB3VuaTA0ODAHdW5pMDQ4MQd1bmkwNDgyB3VuaTA0ODMHdW5pMDQ4NAd1bmkwNDg1B3VuaTA0ODYHdW5pMDQ4OAd1bmkwNDg5B3VuaTA0OEUHdW5pMDQ4Rgd1bmkwNDkwB3VuaTA0OTEHdW5pMDQ5NAd1bmkwNDk1B3VuaTA0OUMHdW5pMDQ5RAd1bmkwNEEwB3VuaTA0QTEHdW5pMDRBNAd1bmkwNEE1B3VuaTA0QTYHdW5pMDRBNwd1bmkwNEE4B3VuaTA0QTkHdW5pMDRCNAd1bmkwNEI1B3VuaTA0QjgHdW5pMDRCOQd1bmkwNEJBB3VuaTA0QkMHdW5pMDRCRAd1bmkwNEMzB3VuaTA0QzQHdW5pMDRDNwd1bmkwNEM4B3VuaTA0RDgHdW5pMDRFMAd1bmkwNEUxB3VuaTA0RkEHdW5pMDRGQgd1bmkwNTAwB3VuaTA1MDIHdW5pMDUwMwd1bmkwNTA0B3VuaTA1MDUHdW5pMDUwNgd1bmkwNTA3B3VuaTA1MDgHdW5pMDUwOQd1bmkwNTBBB3VuaTA1MEIHdW5pMDUwQwd1bmkwNTBEB3VuaTA1MEUHdW5pMDUwRgd1bmkwNTEwB3VuaTIwMDAHdW5pMjAwMQd1bmkyMDAyB3VuaTIwMDMHdW5pMjAwNAd1bmkyMDA1B3VuaTIwMDYHdW5pMjAwNwd1bmkyMDA4B3VuaTIwMDkHdW5pMjAwQQd1bmkyMDBCDXVuZGVyc2NvcmVkYmwNcXVvdGVyZXZlcnNlZAd1bmkyMDI1B3VuaTIwNzQJbnN1cGVyaW9yBEV1cm8HdW5pMjEwNQd1bmkyMTEzB3VuaTIxMTYJZXN0aW1hdGVkCW9uZWVpZ2h0aAx0aHJlZWVpZ2h0aHMLZml2ZWVpZ2h0aHMMc2V2ZW5laWdodGhzB3VuaUZFRkYHdW5pRkZGQwd1bmlGRkZEE2NpcmN1bWZsZXh0aWxkZWNvbWISY2lyY3VtZmxleGhvb2tjb21iE2NpcmN1bWZsZXhncmF2ZWNvbWITY2lyY3VtZmxleGFjdXRlY29tYg5icmV2ZWdyYXZlY29tYhFjb21tYWFjY2VudHJvdGF0ZQZBLnNtY3AGQi5zbWNwBkMuc21jcAZELnNtY3AGRS5zbWNwBkYuc21jcAZHLnNtY3AGSC5zbWNwBkkuc21jcAZKLnNtY3AGSy5zbWNwBkwuc21jcAZNLnNtY3AGTi5zbWNwBk8uc21jcAZRLnNtY3AGUi5zbWNwBlMuc21jcAZULnNtY3AGVS5zbWNwBlYuc21jcAZXLnNtY3AGWC5zbWNwBlkuc21jcAZaLnNtY3ANYnJldmVob29rY29tYg5icmV2ZWFjdXRlY29tYghjcm9zc2JhcglyaW5nYWN1dGUJZGFzaWFveGlhDmJyZXZldGlsZGVjb21iC2N5cmlsbGljdGljDGN5cmlsbGljaG9vawZQLnNtY3AFSy5hbHQPR2VybWFuZGJscy5zbWNwB3VuaTAwQUQHdW5pMDEwQQd1bmkwMTBCB3VuaTAxMjAHdW5pMDEyMQtuYXBvc3Ryb3BoZQd1bmkwMjE4B3VuaTAyMTkHdW5pMDIxQQd1bmkwMjFCB3VuaTAxNjIMdW5pMDE2Mi5zbWNwB3VuaTAxNjMLRGNyb2F0LnNtY3AIRXRoLnNtY3AJVGJhci5zbWNwC0FncmF2ZS5zbWNwC0FhY3V0ZS5zbWNwEEFjaXJjdW1mbGV4LnNtY3ALQXRpbGRlLnNtY3AOQWRpZXJlc2lzLnNtY3AKQXJpbmcuc21jcA9BcmluZ2FjdXRlLnNtY3ANQ2NlZGlsbGEuc21jcAtFZ3JhdmUuc21jcAtFYWN1dGUuc21jcBBFY2lyY3VtZmxleC5zbWNwDkVkaWVyZXNpcy5zbWNwC0lncmF2ZS5zbWNwC0lhY3V0ZS5zbWNwEEljaXJjdW1mbGV4LnNtY3AOSWRpZXJlc2lzLnNtY3ALTnRpbGRlLnNtY3ALT2dyYXZlLnNtY3ALT2FjdXRlLnNtY3AQT2NpcmN1bWZsZXguc21jcAtPdGlsZGUuc21jcA5PZGllcmVzaXMuc21jcAtVZ3JhdmUuc21jcAtVYWN1dGUuc21jcBBVY2lyY3VtZmxleC5zbWNwDlVkaWVyZXNpcy5zbWNwC1lhY3V0ZS5zbWNwDEFtYWNyb24uc21jcAtBYnJldmUuc21jcAxBb2dvbmVrLnNtY3ALQ2FjdXRlLnNtY3AQQ2NpcmN1bWZsZXguc21jcAtDY2Fyb24uc21jcAtEY2Fyb24uc21jcAxFbWFjcm9uLnNtY3ALRWJyZXZlLnNtY3APRWRvdGFjY2VudC5zbWNwDEVvZ29uZWsuc21jcAtFY2Fyb24uc21jcBBHY2lyY3VtZmxleC5zbWNwC0dicmV2ZS5zbWNwEUdjb21tYWFjY2VudC5zbWNwEEhjaXJjdW1mbGV4LnNtY3ALSXRpbGRlLnNtY3AMSW1hY3Jvbi5zbWNwC0licmV2ZS5zbWNwDElvZ29uZWsuc21jcA9JZG90YWNjZW50LnNtY3AQSmNpcmN1bWZsZXguc21jcBFLY29tbWFhY2NlbnQuc21jcAtMYWN1dGUuc21jcBFMY29tbWFhY2NlbnQuc21jcAtMY2Fyb24uc21jcAlMZG90LnNtY3ALTmFjdXRlLnNtY3ARTmNvbW1hYWNjZW50LnNtY3ALTmNhcm9uLnNtY3AMT21hY3Jvbi5zbWNwC09icmV2ZS5zbWNwEk9odW5nYXJ1bWxhdXQuc21jcAtSYWN1dGUuc21jcBFSY29tbWFhY2NlbnQuc21jcAtSY2Fyb24uc21jcAtTYWN1dGUuc21jcBBTY2lyY3VtZmxleC5zbWNwDVNjZWRpbGxhLnNtY3ALU2Nhcm9uLnNtY3ALVGNhcm9uLnNtY3ALVXRpbGRlLnNtY3AMVW1hY3Jvbi5zbWNwC1VicmV2ZS5zbWNwClVyaW5nLnNtY3ASVWh1bmdhcnVtbGF1dC5zbWNwDFVvZ29uZWsuc21jcBBXY2lyY3VtZmxleC5zbWNwEFljaXJjdW1mbGV4LnNtY3AOWWRpZXJlc2lzLnNtY3ALWmFjdXRlLnNtY3APWmRvdGFjY2VudC5zbWNwC1pjYXJvbi5zbWNwCkFscGhhdG9ub3MMRXBzaWxvbnRvbm9zCEV0YXRvbm9zCUlvdGF0b25vcwxPbWljcm9udG9ub3MMVXBzaWxvbnRvbm9zCk9tZWdhdG9ub3MRaW90YWRpZXJlc2lzdG9ub3MFQWxwaGEEQmV0YQdFcHNpbG9uBFpldGEDRXRhBElvdGEFS2FwcGECTXUCTnUHT21pY3JvbgNSaG8DVGF1B1Vwc2lsb24DQ2hpDElvdGFkaWVyZXNpcw9VcHNpbG9uZGllcmVzaXMKYWxwaGF0b25vcwxlcHNpbG9udG9ub3MIZXRhdG9ub3MJaW90YXRvbm9zFHVwc2lsb25kaWVyZXNpc3Rvbm9zBWthcHBhB29taWNyb24HdW5pMDNCQwJudQNjaGkMaW90YWRpZXJlc2lzD3Vwc2lsb25kaWVyZXNpcwxvbWljcm9udG9ub3MMdXBzaWxvbnRvbm9zCm9tZWdhdG9ub3MHdW5pMDQwMQd1bmkwNDAzB3VuaTA0MDUHdW5pMDQwNgd1bmkwNDA3B3VuaTA0MDgHdW5pMDQxQQd1bmkwNDBDB3VuaTA0MEUHdW5pMDQxMAd1bmkwNDEyB3VuaTA0MTMHdW5pMDQxNQd1bmkwNDE5B3VuaTA0MUMHdW5pMDQxRAd1bmkwNDFFB3VuaTA0MUYHdW5pMDQyMAd1bmkwNDIxB3VuaTA0MjIHdW5pMDQyNAd1bmkwNDI1B3VuaTA0MzAHdW5pMDQzNQd1bmkwNDM5B3VuaTA0M0UHdW5pMDQ0MAd1bmkwNDQxB3VuaTA0NDMHdW5pMDQ0NQd1bmkwNDUxB3VuaTA0NTMHdW5pMDQ1NQd1bmkwNDU2B3VuaTA0NTcHdW5pMDQ1OAd1bmkwNDVDB3VuaTA0NUUJZXhjbGFtZGJsB3VuaTAxRjAHdW5pMDJCQwd1bmkxRTNFB3VuaTFFM0YHdW5pMUUwMAd1bmkxRTAxB3VuaTFGNEQHdW5pMDQwMAd1bmkwNDBEB3VuaTA0NTAHdW5pMDQ1RAd1bmkwNDcwB3VuaTA0NzEHdW5pMDQ3Ngd1bmkwNDc3B3VuaTA0OTgHdW5pMDQ5OQd1bmkwNEFBB3VuaTA0QUIHdW5pMDRBRQd1bmkwNEFGB3VuaTA0QzAHdW5pMDRDMQd1bmkwNEMyB3VuaTA0Q0YHdW5pMDREMAd1bmkwNEQxB3VuaTA0RDIHdW5pMDREMwd1bmkwNEQ0B3VuaTA0RDUHdW5pMDRENgd1bmkwNEQ3B3VuaTA0REEHdW5pMDREOQd1bmkwNERCB3VuaTA0REMHdW5pMDRERAd1bmkwNERFB3VuaTA0REYHdW5pMDRFMgd1bmkwNEUzB3VuaTA0RTQHdW5pMDRFNQd1bmkwNEU2B3VuaTA0RTcHdW5pMDRFOAd1bmkwNEU5B3VuaTA0RUEHdW5pMDRFQgd1bmkwNEVDB3VuaTA0RUQHdW5pMDRFRQd1bmkwNEVGB3VuaTA0RjAHdW5pMDRGMQd1bmkwNEYyB3VuaTA0RjMHdW5pMDRGNAd1bmkwNEY1B3VuaTA0RjgHdW5pMDRGOQd1bmkwNEZDB3VuaTA0RkQHdW5pMDUwMQd1bmkwNTEyB3VuaTA1MTMHdW5pMUVBMAd1bmkxRUExB3VuaTFFQTIHdW5pMUVBMwd1bmkxRUE0B3VuaTFFQTUHdW5pMUVBNgd1bmkxRUE3B3VuaTFFQTgHdW5pMUVBOQd1bmkxRUFBB3VuaTFFQUIHdW5pMUVBQwd1bmkxRUFEB3VuaTFFQUUHdW5pMUVBRgd1bmkxRUIwB3VuaTFFQjEHdW5pMUVCMgd1bmkxRUIzB3VuaTFFQjQHdW5pMUVCNQd1bmkxRUI2B3VuaTFFQjcHdW5pMUVCOAd1bmkxRUI5B3VuaTFFQkEHdW5pMUVCQgd1bmkxRUJDB3VuaTFFQkQHdW5pMUVCRQd1bmkxRUJGB3VuaTFFQzAHdW5pMUVDMQd1bmkxRUMyB3VuaTFFQzMHdW5pMUVDNAd1bmkxRUM1B3VuaTFFQzYHdW5pMUVDNwd1bmkxRUM4B3VuaTFFQzkHdW5pMUVDQQd1bmkxRUNCB3VuaTFFQ0MHdW5pMUVDRAd1bmkxRUNFB3VuaTFFQ0YHdW5pMUVEMAd1bmkxRUQxB3VuaTFFRDIHdW5pMUVEMwd1bmkxRUQ0B3VuaTFFRDUHdW5pMUVENgd1bmkxRUQ3B3VuaTFFRDgHdW5pMUVEOQd1bmkxRURBB3VuaTFFREIHdW5pMUVEQwd1bmkxRUREB3VuaTFFREUHdW5pMUVERgd1bmkxRUUwB3VuaTFFRTEHdW5pMUVFMgd1bmkxRUUzB3VuaTFFRTQHdW5pMUVFNQd1bmkxRUU2B3VuaTFFRTcHdW5pMUVFOAd1bmkxRUU5B3VuaTFFRUEHdW5pMUVFQgd1bmkxRUVDB3VuaTFFRUQHdW5pMUVFRQd1bmkxRUVGB3VuaTFFRjAHdW5pMUVGMQd1bmkxRUY0B3VuaTFFRjUHdW5pMUVGNgd1bmkxRUY3B3VuaTFFRjgHdW5pMUVGOQd1bmkyMEFCB3VuaTA0OUEHdW5pMDQ5Qgd1bmkwNEEyB3VuaTA0QTMHdW5pMDRBQwd1bmkwNEFEB3VuaTA0QjIHdW5pMDRCMwd1bmkwNEI2B3VuaTA0QjcHdW5pMDRDQgd1bmkwNENDB3VuaTA0RjYHdW5pMDRGNwd1bmkwNDk2B3VuaTA0OTcHdW5pMDRCRQd1bmkwNEJGB3VuaTA0QkIHdW5pMDQ4RAd1bmkwNDhDB3VuaTA0NjIHdW5p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QBD17NODAqIJBoIQ/vz58u7v+Pr9/PX1+AAFBASCA/Xv7PKDHCxWXmdmZmZfVksqFfFGRkY4MSIB8tWzq6OgoKCigz49HRQbMSklJSUoKCgxOD5QUU4aEQD38+nk2snEw8HBwRwcHCAeGv7g0sC6uLe2+/v54MXAwsfHx8/Y4PsOHDCDHk0JCf////z7+fr99/Py9fwFBsPZ9Pn+////+fLx8vaBHfb04NPEr6+vs7W1s7EE1dXV4Ozw/AERLThEUVFRU4MAgAIADAACAAEAAgAAAISEhIQAgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABAAAAQABAM0A5AAHAPwAgAIADAAEAAEABAAAAQABAPkA5QDnABIAgAIADAAEAAEABAAAAQABAPIA5AAFAPwAgAIADAAEAAEABAAAAQABACEA5QDyABIAgAIADAAFAAEAByAAAIAAVIOFAQABAKcA/QCAAgAMAAUAAQAEAAABAAFA/1sAUgAiAOmAAgAMAAUAAQAEAAABAAFA/1wAVgDvAOiAAgAMAAUAAQAEAAABAAFA/1UAUgAIAPaAAgAMAAQAAQAEAAABAAEApgBSAOgA6QCAAgAMAAUAAQAHIAAAgADag4UBAAEA6wANAIACAAwABAABAAQAAAEAAQDlAP4AAQAKAIACAAwABQABAAUAAACAACyDhYAAy4OFAIACAAwABAABAAQAAAEAAQATAO0AywDwAIACAAwABAABAAQAAAEAAQATAO0AywDwAIACAAwABQABAAcgAACFgADzgwEAAQD8ANUAgAIADAAEAAEABAAAAQABAAYA5QDNAOkAgAIADAAEAAEABAAAAQABAMMA6AD7AOkAgAIADAAFAAEABAAAAQABQP9WAOQA+QDpgAIADAAEAAEABAAAAQABAOwA7QD0AOQAgAIADAAEAAEABAAAAQABANsA5ADeAOkAgAIADAAEAAEABAAAAQABAOIAmwD/ADgAgAIADAAFAAEABAAAAQABAL9A/zkA8ADhgAIADAAEAAEABAAAAQABANoA/ADqAAMAgAIADAAEAAEABAAAAQABAEIA5QDaAOkAgAIADAAEAAEABAAAAQABAP8A6AAIAOkAgAIADAAEAAEABAAAAQABAJsA5AAGAOkAgAIADAAEAAEABAAAAQABABYA5ADqAOkAgAIADAAEAAEABAAA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KWNzf0AAggh+WDQ5NzU2LBiDgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABiAAAQABADoA5ACFgAACgwCAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAQAAQAEAAABAAEAswCiAOEACACAAgAMAAQAAQAEAAABAAEACgCsAP8A/gCAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAQAAQAEAAABAAEA+wC4AN0A/QCAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAAQAAQAEAAABAAEAEwCtAOQAEwCAAgAMAAIAAQACAAAAhISEhACAAgAMAAIAAQACAAAAhISEhACAAgAMAGoAAQBrAAAAM/vqyr2woaCgobC9yej5CiYzP1BV3NXV2d7u+QISGB4lJCQlHhgTBPv05d/Y1dxVTj81Kg6DBaCgrrrH6oEQFTpHVGJiYlpRRycPDxINCgeCA/z7+vuBAwUGBQSCCvXw7Orz89m4r6aggzPxBSMtN0JCQkI4LiME8OXQyMCzsAcJBwQB+PTy7ero5ubm5unr7fP2/QYICgoHsLPBytPogxhISDkuIw0F+fHb0Ma3t7e+xczb5OTy/f8BghcCAgMA+QX/+/v8/////wEEER0dJDM5QEiDgAIADAACAAEAAgAAAISEhIQAgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABAAAAQABAAQA5QDNAAIAgAIADAAEAAEABAAAAQABAIMA6QACAA4AgAIADAACAAEAAgAAAISEhIQAgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABAAAAQABAPQAIwDgAP0AgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABAAAAQABALcA6AAkAA4AgAIADAAEAAEABAAAAQABAPoAwwD6AAYAgAIADAAFAAEABQAAAAET74OFAfX9g4UAgAIADAAEAAEABAAAAQABAC0AZwAFAPcAgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABAAAAQABAPAA6AD9AAIAgAIADAAEAAEABAAAAQABAMAA6QD7AAIAgAIADAAEAAEABAAAAQABANcABwDcAAUAgAIADAAEAAEABAAAAQABANIABgDQAA0AgAIADAAEAAEABAAAAQABAC0AEwDEAP4AgAIADAAEAAEABAAAAQABAEQA5QDmAPkAgAIADAAEAAEABAAAAQABACIA8QC/APgAgAIADAAEAAEABAAAAQABADAA5gC8AAIAgAIADAAEAAEABAAAAQABADsA5gDGAA4AgAIADAACAAEAAgAAAISEhIQAgAIADAACAAEAAgAAAISEhIQAgAIADAAFAAEABAAAAQABQAGCAKYA/wAugAIADAAFAAEABAAAAQABQAFQAKgA+gAmgAIADAAEAAEABAAAAQABAA8AGwDsANEAgAIADAAEAAEABAAAAQABABIAEgDVANEAgAIADAAEAAEABAAAAQABAAMAEQDjANYAgAIADAAEAAEABAAAAQABAP8AEQDPANYAgAIADAACAAEAAgAAAISEhIQAgAIADAACAAEAAgAAAISEhIQAgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABAAAAQABAO4ArADoAP4AgAIADAAEAAEABAAAAQABAP4ArQD5ABMAgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABAAAAQABAP8ArADxAAcAgAIADAAEAAEABAAAAQABABEArgDRAAcAgAIADAAEAAEABAAAAQABAPoA5ADkAAIAgAIADAAEAAEABAAAAQABAAwA5wDDAAIAgAIADAACAAEAAgAAAISEhIQAgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABAAAAQABAAsArAAEAP4AgAIADAAEAAEABAAAAQABAAkArADbAAcAgAIADAAEAAEABAAAAQABAAgA5AD2APkAgAIADAACAAEAAgAAAISEhIQAgAIADAAEAAEABAAAAQABAAMA5QDVAAIAgAIADAAEAAEABAAAAQABAO8A5ADaAPkAgAIADAAEAAEABAAAAQABAOMA5QDrAA4AgAIADAAFAAEAByAAAIWAAOSDAQABAOsA7ACAAgAMAAQAAQAEAAABAAEACADlANkAAgCAAgAMAAQAAQAEAAABAAEAAQAMANYA7gCAAgAMAAUAAQAHIAAAgAAFg4UBAAEA3QAEAIACAAwABAABAAQAAAEAAQD2APAAzwD4AIACAAwABAABAAQAAAEAAQAOAOUA1gAOAIACAAwABAABAAQAAAEAAQDtAOQAzgACAIACAAwABAABAAQAAAEAAQD9AOUA5gACAIACAAwAAgABAAIAAACEhISEAIACAAwAAgABAAIAAACEhISEAIACAAwABAABAAQAAAEAAQDoAOQA1AD9AIACAAwABAABAAQAAAEAAQAwAOQAAgDwAIACAAwABAABAAQAAAEAAQAIAOQAvQDrAIACAAwABAABAAQAAAEAAQD2AOUA5wACAIACAAwABQABAAcgAACAAPuDhQEAAQD4AO8AgAIADAAEAAEABAAAAQABAOsAFgDzAPcAgAIADAAEAAEABAAAAQABAAUA5ADxAPkAgAIADAAEAAEABAAAAQABAPUA+wDtAAEAgAIADAAEAAEABAAAAQABAOAA5AAHAPkAgAIADAAEAAEABAAAAQABANAA+wACAAEAgAIADAAEAAEABAAAAQABAFYA5AANAPkAgAIADAAEAAEABiAAAQABACkA5QCFgAAOgwCAAgAMAAQAAQAEAAABAAEAIADkANsAAgCAAgAMAAQAAQAEAAABAAEAXADlANUAAgCAAgAMAAYAAQAFAAAAgED/dYOFgAAKg4WAAgAMAAUAAQAFAAAAgADCg4WAACqDhQCAAgAMAAIAAQACAAAAhISEhACAAgAMAAUAAQAFAAAAgACHg4WAAFCDhQCAAgAMAAYAAQAFAAAAgED/U4OFgABDg4WAAgAMAAYAAQAHIAAAgEAAhYOFAQABAOUABYACAAwABQABAAcgAACAAHeDhQEAAQDcAA0AgAIADAAEAAEABAAAAQABABoAFgAQAPAAgAIADAAEAAEABAAAAQABACwAGADvAPAAgAIADAAEAAEABAAAAQABAP8A6AD8AAUAgAIADAAEAAEABAAAAQABABAA6gDbAAUAgAIADAAEAAEABAAAAQABACQA+QDwAPkAgAIADAAEAAEABAAAAQABADYA+wDPAPoAgAIADAAEAAEABAAAAQABABgAHwDxAAgAgAIADAAEAAEABAAAAQABACkAIADPAAgAgAIADAAFAAEAByAAAIAA9oOFAQABAPUABQCAAgAMAAQAAQAEAAABAAEACAACANQABQCAAgAMAAsAAQAKIAAAgEH/dgCFg4AA5IQCAQEBAf/lAQIFgAIADAAJAAEACiAAAIABh3eDgADnhAIBAQEB3twBAg2AAgAMAAUAAQAHIAAAgAD+g4UBAAEA9QD4AIACAAwABAABAAQAAAEAAQAPAAIA1AD4AIACAAwABQABAAcgAACAAP2DhQEAAQD5ADEAgAIADAAEAAEABAAAAQABAA4AAgDXADEAgAIADAAFAAEAByAAAIAA/oOFAQABAOwA9ACAAgAMAAQAAQAEAAABAAEAEAACAMsA9QCAAgAMAAUAAQAHIAAAgAD5g4UBAAEA8gDwAIACAAwABAABAAQAAAEAAQALAAIA0QDxAIACAAwACwABAAogAACAAP9AAIWDgACshAIBAQEB8eUBBwWAAgAMAAkAAQAKIAAAgAERd4OAAK6EAgEBAQHR3AEHDYACAAwABQABAAUAAACAADCDhYAACoOFAIACAAwABQABAAYgAAEAAUAAlAAEAIAA8IOFgAIADAAEAAEABAAAAQABABIAFgAjAOcAgAIADAAEAAEABAAAAQABACQAFgD5APAAgAIADAAEAAEABAAAAQABABQA7QANAPQAgAIADAAEAAEABAAAAQABABYA7QDjAP0AgAIADAAEAAEABAAAAQABABAA6AAPAPwAgAIADAAEAAEABAAAAQABAAkA6ADlAAUAgAIADAAEAAEABAAAAQABACQA+QADAPAAgAIADAAEAAEABAAAAQABAC4A+QDZAPkAgAIADAAEAAEABAAAAQABACkAHwADAP8AgAIADAAEAAEABAAAAQABACEAHgDZAAgAgAIADAAFAAEAByAAAIAABoOFAQABAAgA/ACAAgAMAAIAAQAHIAAAhYUBAAEA3gAFgAIADAAJAAEACQAAAIABgjCDgADkhIABEgqDgAD5hACAAgAMAAgAAQAKIAACAQEBAIBAAJQB5QQAgAHo8IOAAAKEgAIADAAEAAEABAAAAQABAFsAFgAtAPAAgAIADAAEAAEABAAAAQABABQAVAANAOsAgAIADAAGAAEABQAAAIBAAM6DhYAAEYOF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';

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var cryptoJs = {exports: {}};

    function commonjsRequire(path) {
    	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }

    var core = {exports: {}};

    var hasRequiredCore;

    function requireCore () {
    	if (hasRequiredCore) return core.exports;
    	hasRequiredCore = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory();
    			}
    		}(commonjsGlobal, function () {

    			/*globals window, global, require*/

    			/**
    			 * CryptoJS core components.
    			 */
    			var CryptoJS = CryptoJS || (function (Math, undefined$1) {

    			    var crypto;

    			    // Native crypto from window (Browser)
    			    if (typeof window !== 'undefined' && window.crypto) {
    			        crypto = window.crypto;
    			    }

    			    // Native crypto in web worker (Browser)
    			    if (typeof self !== 'undefined' && self.crypto) {
    			        crypto = self.crypto;
    			    }

    			    // Native crypto from worker
    			    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    			        crypto = globalThis.crypto;
    			    }

    			    // Native (experimental IE 11) crypto from window (Browser)
    			    if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
    			        crypto = window.msCrypto;
    			    }

    			    // Native crypto from global (NodeJS)
    			    if (!crypto && typeof commonjsGlobal !== 'undefined' && commonjsGlobal.crypto) {
    			        crypto = commonjsGlobal.crypto;
    			    }

    			    // Native crypto import via require (NodeJS)
    			    if (!crypto && typeof commonjsRequire === 'function') {
    			        try {
    			            crypto = require('crypto');
    			        } catch (err) {}
    			    }

    			    /*
    			     * Cryptographically secure pseudorandom number generator
    			     *
    			     * As Math.random() is cryptographically not safe to use
    			     */
    			    var cryptoSecureRandomInt = function () {
    			        if (crypto) {
    			            // Use getRandomValues method (Browser)
    			            if (typeof crypto.getRandomValues === 'function') {
    			                try {
    			                    return crypto.getRandomValues(new Uint32Array(1))[0];
    			                } catch (err) {}
    			            }

    			            // Use randomBytes method (NodeJS)
    			            if (typeof crypto.randomBytes === 'function') {
    			                try {
    			                    return crypto.randomBytes(4).readInt32LE();
    			                } catch (err) {}
    			            }
    			        }

    			        throw new Error('Native crypto module could not be used to get secure random number.');
    			    };

    			    /*
    			     * Local polyfill of Object.create

    			     */
    			    var create = Object.create || (function () {
    			        function F() {}

    			        return function (obj) {
    			            var subtype;

    			            F.prototype = obj;

    			            subtype = new F();

    			            F.prototype = null;

    			            return subtype;
    			        };
    			    }());

    			    /**
    			     * CryptoJS namespace.
    			     */
    			    var C = {};

    			    /**
    			     * Library namespace.
    			     */
    			    var C_lib = C.lib = {};

    			    /**
    			     * Base object for prototypal inheritance.
    			     */
    			    var Base = C_lib.Base = (function () {


    			        return {
    			            /**
    			             * Creates a new object that inherits from this object.
    			             *
    			             * @param {Object} overrides Properties to copy into the new object.
    			             *
    			             * @return {Object} The new object.
    			             *
    			             * @static
    			             *
    			             * @example
    			             *
    			             *     var MyType = CryptoJS.lib.Base.extend({
    			             *         field: 'value',
    			             *
    			             *         method: function () {
    			             *         }
    			             *     });
    			             */
    			            extend: function (overrides) {
    			                // Spawn
    			                var subtype = create(this);

    			                // Augment
    			                if (overrides) {
    			                    subtype.mixIn(overrides);
    			                }

    			                // Create default initializer
    			                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
    			                    subtype.init = function () {
    			                        subtype.$super.init.apply(this, arguments);
    			                    };
    			                }

    			                // Initializer's prototype is the subtype object
    			                subtype.init.prototype = subtype;

    			                // Reference supertype
    			                subtype.$super = this;

    			                return subtype;
    			            },

    			            /**
    			             * Extends this object and runs the init method.
    			             * Arguments to create() will be passed to init().
    			             *
    			             * @return {Object} The new object.
    			             *
    			             * @static
    			             *
    			             * @example
    			             *
    			             *     var instance = MyType.create();
    			             */
    			            create: function () {
    			                var instance = this.extend();
    			                instance.init.apply(instance, arguments);

    			                return instance;
    			            },

    			            /**
    			             * Initializes a newly created object.
    			             * Override this method to add some logic when your objects are created.
    			             *
    			             * @example
    			             *
    			             *     var MyType = CryptoJS.lib.Base.extend({
    			             *         init: function () {
    			             *             // ...
    			             *         }
    			             *     });
    			             */
    			            init: function () {
    			            },

    			            /**
    			             * Copies properties into this object.
    			             *
    			             * @param {Object} properties The properties to mix in.
    			             *
    			             * @example
    			             *
    			             *     MyType.mixIn({
    			             *         field: 'value'
    			             *     });
    			             */
    			            mixIn: function (properties) {
    			                for (var propertyName in properties) {
    			                    if (properties.hasOwnProperty(propertyName)) {
    			                        this[propertyName] = properties[propertyName];
    			                    }
    			                }

    			                // IE won't copy toString using the loop above
    			                if (properties.hasOwnProperty('toString')) {
    			                    this.toString = properties.toString;
    			                }
    			            },

    			            /**
    			             * Creates a copy of this object.
    			             *
    			             * @return {Object} The clone.
    			             *
    			             * @example
    			             *
    			             *     var clone = instance.clone();
    			             */
    			            clone: function () {
    			                return this.init.prototype.extend(this);
    			            }
    			        };
    			    }());

    			    /**
    			     * An array of 32-bit words.
    			     *
    			     * @property {Array} words The array of 32-bit words.
    			     * @property {number} sigBytes The number of significant bytes in this word array.
    			     */
    			    var WordArray = C_lib.WordArray = Base.extend({
    			        /**
    			         * Initializes a newly created word array.
    			         *
    			         * @param {Array} words (Optional) An array of 32-bit words.
    			         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.lib.WordArray.create();
    			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
    			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
    			         */
    			        init: function (words, sigBytes) {
    			            words = this.words = words || [];

    			            if (sigBytes != undefined$1) {
    			                this.sigBytes = sigBytes;
    			            } else {
    			                this.sigBytes = words.length * 4;
    			            }
    			        },

    			        /**
    			         * Converts this word array to a string.
    			         *
    			         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
    			         *
    			         * @return {string} The stringified word array.
    			         *
    			         * @example
    			         *
    			         *     var string = wordArray + '';
    			         *     var string = wordArray.toString();
    			         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
    			         */
    			        toString: function (encoder) {
    			            return (encoder || Hex).stringify(this);
    			        },

    			        /**
    			         * Concatenates a word array to this word array.
    			         *
    			         * @param {WordArray} wordArray The word array to append.
    			         *
    			         * @return {WordArray} This word array.
    			         *
    			         * @example
    			         *
    			         *     wordArray1.concat(wordArray2);
    			         */
    			        concat: function (wordArray) {
    			            // Shortcuts
    			            var thisWords = this.words;
    			            var thatWords = wordArray.words;
    			            var thisSigBytes = this.sigBytes;
    			            var thatSigBytes = wordArray.sigBytes;

    			            // Clamp excess bits
    			            this.clamp();

    			            // Concat
    			            if (thisSigBytes % 4) {
    			                // Copy one byte at a time
    			                for (var i = 0; i < thatSigBytes; i++) {
    			                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    			                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
    			                }
    			            } else {
    			                // Copy one word at a time
    			                for (var j = 0; j < thatSigBytes; j += 4) {
    			                    thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
    			                }
    			            }
    			            this.sigBytes += thatSigBytes;

    			            // Chainable
    			            return this;
    			        },

    			        /**
    			         * Removes insignificant bits.
    			         *
    			         * @example
    			         *
    			         *     wordArray.clamp();
    			         */
    			        clamp: function () {
    			            // Shortcuts
    			            var words = this.words;
    			            var sigBytes = this.sigBytes;

    			            // Clamp
    			            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
    			            words.length = Math.ceil(sigBytes / 4);
    			        },

    			        /**
    			         * Creates a copy of this word array.
    			         *
    			         * @return {WordArray} The clone.
    			         *
    			         * @example
    			         *
    			         *     var clone = wordArray.clone();
    			         */
    			        clone: function () {
    			            var clone = Base.clone.call(this);
    			            clone.words = this.words.slice(0);

    			            return clone;
    			        },

    			        /**
    			         * Creates a word array filled with random bytes.
    			         *
    			         * @param {number} nBytes The number of random bytes to generate.
    			         *
    			         * @return {WordArray} The random word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.lib.WordArray.random(16);
    			         */
    			        random: function (nBytes) {
    			            var words = [];

    			            for (var i = 0; i < nBytes; i += 4) {
    			                words.push(cryptoSecureRandomInt());
    			            }

    			            return new WordArray.init(words, nBytes);
    			        }
    			    });

    			    /**
    			     * Encoder namespace.
    			     */
    			    var C_enc = C.enc = {};

    			    /**
    			     * Hex encoding strategy.
    			     */
    			    var Hex = C_enc.Hex = {
    			        /**
    			         * Converts a word array to a hex string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The hex string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var hexChars = [];
    			            for (var i = 0; i < sigBytes; i++) {
    			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    			                hexChars.push((bite >>> 4).toString(16));
    			                hexChars.push((bite & 0x0f).toString(16));
    			            }

    			            return hexChars.join('');
    			        },

    			        /**
    			         * Converts a hex string to a word array.
    			         *
    			         * @param {string} hexStr The hex string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
    			         */
    			        parse: function (hexStr) {
    			            // Shortcut
    			            var hexStrLength = hexStr.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < hexStrLength; i += 2) {
    			                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
    			            }

    			            return new WordArray.init(words, hexStrLength / 2);
    			        }
    			    };

    			    /**
    			     * Latin1 encoding strategy.
    			     */
    			    var Latin1 = C_enc.Latin1 = {
    			        /**
    			         * Converts a word array to a Latin1 string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The Latin1 string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var latin1Chars = [];
    			            for (var i = 0; i < sigBytes; i++) {
    			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    			                latin1Chars.push(String.fromCharCode(bite));
    			            }

    			            return latin1Chars.join('');
    			        },

    			        /**
    			         * Converts a Latin1 string to a word array.
    			         *
    			         * @param {string} latin1Str The Latin1 string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
    			         */
    			        parse: function (latin1Str) {
    			            // Shortcut
    			            var latin1StrLength = latin1Str.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < latin1StrLength; i++) {
    			                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    			            }

    			            return new WordArray.init(words, latin1StrLength);
    			        }
    			    };

    			    /**
    			     * UTF-8 encoding strategy.
    			     */
    			    var Utf8 = C_enc.Utf8 = {
    			        /**
    			         * Converts a word array to a UTF-8 string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The UTF-8 string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            try {
    			                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
    			            } catch (e) {
    			                throw new Error('Malformed UTF-8 data');
    			            }
    			        },

    			        /**
    			         * Converts a UTF-8 string to a word array.
    			         *
    			         * @param {string} utf8Str The UTF-8 string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
    			         */
    			        parse: function (utf8Str) {
    			            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
    			        }
    			    };

    			    /**
    			     * Abstract buffered block algorithm template.
    			     *
    			     * The property blockSize must be implemented in a concrete subtype.
    			     *
    			     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
    			     */
    			    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
    			        /**
    			         * Resets this block algorithm's data buffer to its initial state.
    			         *
    			         * @example
    			         *
    			         *     bufferedBlockAlgorithm.reset();
    			         */
    			        reset: function () {
    			            // Initial values
    			            this._data = new WordArray.init();
    			            this._nDataBytes = 0;
    			        },

    			        /**
    			         * Adds new data to this block algorithm's buffer.
    			         *
    			         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
    			         *
    			         * @example
    			         *
    			         *     bufferedBlockAlgorithm._append('data');
    			         *     bufferedBlockAlgorithm._append(wordArray);
    			         */
    			        _append: function (data) {
    			            // Convert string to WordArray, else assume WordArray already
    			            if (typeof data == 'string') {
    			                data = Utf8.parse(data);
    			            }

    			            // Append
    			            this._data.concat(data);
    			            this._nDataBytes += data.sigBytes;
    			        },

    			        /**
    			         * Processes available data blocks.
    			         *
    			         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
    			         *
    			         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
    			         *
    			         * @return {WordArray} The processed data.
    			         *
    			         * @example
    			         *
    			         *     var processedData = bufferedBlockAlgorithm._process();
    			         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
    			         */
    			        _process: function (doFlush) {
    			            var processedWords;

    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;
    			            var dataSigBytes = data.sigBytes;
    			            var blockSize = this.blockSize;
    			            var blockSizeBytes = blockSize * 4;

    			            // Count blocks ready
    			            var nBlocksReady = dataSigBytes / blockSizeBytes;
    			            if (doFlush) {
    			                // Round up to include partial blocks
    			                nBlocksReady = Math.ceil(nBlocksReady);
    			            } else {
    			                // Round down to include only full blocks,
    			                // less the number of blocks that must remain in the buffer
    			                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    			            }

    			            // Count words ready
    			            var nWordsReady = nBlocksReady * blockSize;

    			            // Count bytes ready
    			            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

    			            // Process blocks
    			            if (nWordsReady) {
    			                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
    			                    // Perform concrete-algorithm logic
    			                    this._doProcessBlock(dataWords, offset);
    			                }

    			                // Remove processed words
    			                processedWords = dataWords.splice(0, nWordsReady);
    			                data.sigBytes -= nBytesReady;
    			            }

    			            // Return processed words
    			            return new WordArray.init(processedWords, nBytesReady);
    			        },

    			        /**
    			         * Creates a copy of this object.
    			         *
    			         * @return {Object} The clone.
    			         *
    			         * @example
    			         *
    			         *     var clone = bufferedBlockAlgorithm.clone();
    			         */
    			        clone: function () {
    			            var clone = Base.clone.call(this);
    			            clone._data = this._data.clone();

    			            return clone;
    			        },

    			        _minBufferSize: 0
    			    });

    			    /**
    			     * Abstract hasher template.
    			     *
    			     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
    			     */
    			    C_lib.Hasher = BufferedBlockAlgorithm.extend({
    			        /**
    			         * Configuration options.
    			         */
    			        cfg: Base.extend(),

    			        /**
    			         * Initializes a newly created hasher.
    			         *
    			         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
    			         *
    			         * @example
    			         *
    			         *     var hasher = CryptoJS.algo.SHA256.create();
    			         */
    			        init: function (cfg) {
    			            // Apply config defaults
    			            this.cfg = this.cfg.extend(cfg);

    			            // Set initial values
    			            this.reset();
    			        },

    			        /**
    			         * Resets this hasher to its initial state.
    			         *
    			         * @example
    			         *
    			         *     hasher.reset();
    			         */
    			        reset: function () {
    			            // Reset data buffer
    			            BufferedBlockAlgorithm.reset.call(this);

    			            // Perform concrete-hasher logic
    			            this._doReset();
    			        },

    			        /**
    			         * Updates this hasher with a message.
    			         *
    			         * @param {WordArray|string} messageUpdate The message to append.
    			         *
    			         * @return {Hasher} This hasher.
    			         *
    			         * @example
    			         *
    			         *     hasher.update('message');
    			         *     hasher.update(wordArray);
    			         */
    			        update: function (messageUpdate) {
    			            // Append
    			            this._append(messageUpdate);

    			            // Update the hash
    			            this._process();

    			            // Chainable
    			            return this;
    			        },

    			        /**
    			         * Finalizes the hash computation.
    			         * Note that the finalize operation is effectively a destructive, read-once operation.
    			         *
    			         * @param {WordArray|string} messageUpdate (Optional) A final message update.
    			         *
    			         * @return {WordArray} The hash.
    			         *
    			         * @example
    			         *
    			         *     var hash = hasher.finalize();
    			         *     var hash = hasher.finalize('message');
    			         *     var hash = hasher.finalize(wordArray);
    			         */
    			        finalize: function (messageUpdate) {
    			            // Final message update
    			            if (messageUpdate) {
    			                this._append(messageUpdate);
    			            }

    			            // Perform concrete-hasher logic
    			            var hash = this._doFinalize();

    			            return hash;
    			        },

    			        blockSize: 512/32,

    			        /**
    			         * Creates a shortcut function to a hasher's object interface.
    			         *
    			         * @param {Hasher} hasher The hasher to create a helper for.
    			         *
    			         * @return {Function} The shortcut function.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
    			         */
    			        _createHelper: function (hasher) {
    			            return function (message, cfg) {
    			                return new hasher.init(cfg).finalize(message);
    			            };
    			        },

    			        /**
    			         * Creates a shortcut function to the HMAC's object interface.
    			         *
    			         * @param {Hasher} hasher The hasher to use in this HMAC helper.
    			         *
    			         * @return {Function} The shortcut function.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
    			         */
    			        _createHmacHelper: function (hasher) {
    			            return function (message, key) {
    			                return new C_algo.HMAC.init(hasher, key).finalize(message);
    			            };
    			        }
    			    });

    			    /**
    			     * Algorithm namespace.
    			     */
    			    var C_algo = C.algo = {};

    			    return C;
    			}(Math));


    			return CryptoJS;

    		}));
    } (core));
    	return core.exports;
    }

    var x64Core = {exports: {}};

    var hasRequiredX64Core;

    function requireX64Core () {
    	if (hasRequiredX64Core) return x64Core.exports;
    	hasRequiredX64Core = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (undefined$1) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var X32WordArray = C_lib.WordArray;

    			    /**
    			     * x64 namespace.
    			     */
    			    var C_x64 = C.x64 = {};

    			    /**
    			     * A 64-bit word.
    			     */
    			    C_x64.Word = Base.extend({
    			        /**
    			         * Initializes a newly created 64-bit word.
    			         *
    			         * @param {number} high The high 32 bits.
    			         * @param {number} low The low 32 bits.
    			         *
    			         * @example
    			         *
    			         *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
    			         */
    			        init: function (high, low) {
    			            this.high = high;
    			            this.low = low;
    			        }

    			        /**
    			         * Bitwise NOTs this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after negating.
    			         *
    			         * @example
    			         *
    			         *     var negated = x64Word.not();
    			         */
    			        // not: function () {
    			            // var high = ~this.high;
    			            // var low = ~this.low;

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Bitwise ANDs this word with the passed word.
    			         *
    			         * @param {X64Word} word The x64-Word to AND with this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after ANDing.
    			         *
    			         * @example
    			         *
    			         *     var anded = x64Word.and(anotherX64Word);
    			         */
    			        // and: function (word) {
    			            // var high = this.high & word.high;
    			            // var low = this.low & word.low;

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Bitwise ORs this word with the passed word.
    			         *
    			         * @param {X64Word} word The x64-Word to OR with this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after ORing.
    			         *
    			         * @example
    			         *
    			         *     var ored = x64Word.or(anotherX64Word);
    			         */
    			        // or: function (word) {
    			            // var high = this.high | word.high;
    			            // var low = this.low | word.low;

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Bitwise XORs this word with the passed word.
    			         *
    			         * @param {X64Word} word The x64-Word to XOR with this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after XORing.
    			         *
    			         * @example
    			         *
    			         *     var xored = x64Word.xor(anotherX64Word);
    			         */
    			        // xor: function (word) {
    			            // var high = this.high ^ word.high;
    			            // var low = this.low ^ word.low;

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Shifts this word n bits to the left.
    			         *
    			         * @param {number} n The number of bits to shift.
    			         *
    			         * @return {X64Word} A new x64-Word object after shifting.
    			         *
    			         * @example
    			         *
    			         *     var shifted = x64Word.shiftL(25);
    			         */
    			        // shiftL: function (n) {
    			            // if (n < 32) {
    			                // var high = (this.high << n) | (this.low >>> (32 - n));
    			                // var low = this.low << n;
    			            // } else {
    			                // var high = this.low << (n - 32);
    			                // var low = 0;
    			            // }

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Shifts this word n bits to the right.
    			         *
    			         * @param {number} n The number of bits to shift.
    			         *
    			         * @return {X64Word} A new x64-Word object after shifting.
    			         *
    			         * @example
    			         *
    			         *     var shifted = x64Word.shiftR(7);
    			         */
    			        // shiftR: function (n) {
    			            // if (n < 32) {
    			                // var low = (this.low >>> n) | (this.high << (32 - n));
    			                // var high = this.high >>> n;
    			            // } else {
    			                // var low = this.high >>> (n - 32);
    			                // var high = 0;
    			            // }

    			            // return X64Word.create(high, low);
    			        // },

    			        /**
    			         * Rotates this word n bits to the left.
    			         *
    			         * @param {number} n The number of bits to rotate.
    			         *
    			         * @return {X64Word} A new x64-Word object after rotating.
    			         *
    			         * @example
    			         *
    			         *     var rotated = x64Word.rotL(25);
    			         */
    			        // rotL: function (n) {
    			            // return this.shiftL(n).or(this.shiftR(64 - n));
    			        // },

    			        /**
    			         * Rotates this word n bits to the right.
    			         *
    			         * @param {number} n The number of bits to rotate.
    			         *
    			         * @return {X64Word} A new x64-Word object after rotating.
    			         *
    			         * @example
    			         *
    			         *     var rotated = x64Word.rotR(7);
    			         */
    			        // rotR: function (n) {
    			            // return this.shiftR(n).or(this.shiftL(64 - n));
    			        // },

    			        /**
    			         * Adds this word with the passed word.
    			         *
    			         * @param {X64Word} word The x64-Word to add with this word.
    			         *
    			         * @return {X64Word} A new x64-Word object after adding.
    			         *
    			         * @example
    			         *
    			         *     var added = x64Word.add(anotherX64Word);
    			         */
    			        // add: function (word) {
    			            // var low = (this.low + word.low) | 0;
    			            // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
    			            // var high = (this.high + word.high + carry) | 0;

    			            // return X64Word.create(high, low);
    			        // }
    			    });

    			    /**
    			     * An array of 64-bit words.
    			     *
    			     * @property {Array} words The array of CryptoJS.x64.Word objects.
    			     * @property {number} sigBytes The number of significant bytes in this word array.
    			     */
    			    C_x64.WordArray = Base.extend({
    			        /**
    			         * Initializes a newly created word array.
    			         *
    			         * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
    			         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.x64.WordArray.create();
    			         *
    			         *     var wordArray = CryptoJS.x64.WordArray.create([
    			         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
    			         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
    			         *     ]);
    			         *
    			         *     var wordArray = CryptoJS.x64.WordArray.create([
    			         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
    			         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
    			         *     ], 10);
    			         */
    			        init: function (words, sigBytes) {
    			            words = this.words = words || [];

    			            if (sigBytes != undefined$1) {
    			                this.sigBytes = sigBytes;
    			            } else {
    			                this.sigBytes = words.length * 8;
    			            }
    			        },

    			        /**
    			         * Converts this 64-bit word array to a 32-bit word array.
    			         *
    			         * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
    			         *
    			         * @example
    			         *
    			         *     var x32WordArray = x64WordArray.toX32();
    			         */
    			        toX32: function () {
    			            // Shortcuts
    			            var x64Words = this.words;
    			            var x64WordsLength = x64Words.length;

    			            // Convert
    			            var x32Words = [];
    			            for (var i = 0; i < x64WordsLength; i++) {
    			                var x64Word = x64Words[i];
    			                x32Words.push(x64Word.high);
    			                x32Words.push(x64Word.low);
    			            }

    			            return X32WordArray.create(x32Words, this.sigBytes);
    			        },

    			        /**
    			         * Creates a copy of this word array.
    			         *
    			         * @return {X64WordArray} The clone.
    			         *
    			         * @example
    			         *
    			         *     var clone = x64WordArray.clone();
    			         */
    			        clone: function () {
    			            var clone = Base.clone.call(this);

    			            // Clone "words" array
    			            var words = clone.words = this.words.slice(0);

    			            // Clone each X64Word object
    			            var wordsLength = words.length;
    			            for (var i = 0; i < wordsLength; i++) {
    			                words[i] = words[i].clone();
    			            }

    			            return clone;
    			        }
    			    });
    			}());


    			return CryptoJS;

    		}));
    } (x64Core));
    	return x64Core.exports;
    }

    var libTypedarrays = {exports: {}};

    var hasRequiredLibTypedarrays;

    function requireLibTypedarrays () {
    	if (hasRequiredLibTypedarrays) return libTypedarrays.exports;
    	hasRequiredLibTypedarrays = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Check if typed arrays are supported
    			    if (typeof ArrayBuffer != 'function') {
    			        return;
    			    }

    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;

    			    // Reference original init
    			    var superInit = WordArray.init;

    			    // Augment WordArray.init to handle typed arrays
    			    var subInit = WordArray.init = function (typedArray) {
    			        // Convert buffers to uint8
    			        if (typedArray instanceof ArrayBuffer) {
    			            typedArray = new Uint8Array(typedArray);
    			        }

    			        // Convert other array views to uint8
    			        if (
    			            typedArray instanceof Int8Array ||
    			            (typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray) ||
    			            typedArray instanceof Int16Array ||
    			            typedArray instanceof Uint16Array ||
    			            typedArray instanceof Int32Array ||
    			            typedArray instanceof Uint32Array ||
    			            typedArray instanceof Float32Array ||
    			            typedArray instanceof Float64Array
    			        ) {
    			            typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    			        }

    			        // Handle Uint8Array
    			        if (typedArray instanceof Uint8Array) {
    			            // Shortcut
    			            var typedArrayByteLength = typedArray.byteLength;

    			            // Extract bytes
    			            var words = [];
    			            for (var i = 0; i < typedArrayByteLength; i++) {
    			                words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
    			            }

    			            // Initialize this word array
    			            superInit.call(this, words, typedArrayByteLength);
    			        } else {
    			            // Else call normal init
    			            superInit.apply(this, arguments);
    			        }
    			    };

    			    subInit.prototype = WordArray;
    			}());


    			return CryptoJS.lib.WordArray;

    		}));
    } (libTypedarrays));
    	return libTypedarrays.exports;
    }

    var encUtf16 = {exports: {}};

    var hasRequiredEncUtf16;

    function requireEncUtf16 () {
    	if (hasRequiredEncUtf16) return encUtf16.exports;
    	hasRequiredEncUtf16 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var C_enc = C.enc;

    			    /**
    			     * UTF-16 BE encoding strategy.
    			     */
    			    C_enc.Utf16 = C_enc.Utf16BE = {
    			        /**
    			         * Converts a word array to a UTF-16 BE string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The UTF-16 BE string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var utf16Chars = [];
    			            for (var i = 0; i < sigBytes; i += 2) {
    			                var codePoint = (words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff;
    			                utf16Chars.push(String.fromCharCode(codePoint));
    			            }

    			            return utf16Chars.join('');
    			        },

    			        /**
    			         * Converts a UTF-16 BE string to a word array.
    			         *
    			         * @param {string} utf16Str The UTF-16 BE string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
    			         */
    			        parse: function (utf16Str) {
    			            // Shortcut
    			            var utf16StrLength = utf16Str.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < utf16StrLength; i++) {
    			                words[i >>> 1] |= utf16Str.charCodeAt(i) << (16 - (i % 2) * 16);
    			            }

    			            return WordArray.create(words, utf16StrLength * 2);
    			        }
    			    };

    			    /**
    			     * UTF-16 LE encoding strategy.
    			     */
    			    C_enc.Utf16LE = {
    			        /**
    			         * Converts a word array to a UTF-16 LE string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The UTF-16 LE string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;

    			            // Convert
    			            var utf16Chars = [];
    			            for (var i = 0; i < sigBytes; i += 2) {
    			                var codePoint = swapEndian((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff);
    			                utf16Chars.push(String.fromCharCode(codePoint));
    			            }

    			            return utf16Chars.join('');
    			        },

    			        /**
    			         * Converts a UTF-16 LE string to a word array.
    			         *
    			         * @param {string} utf16Str The UTF-16 LE string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
    			         */
    			        parse: function (utf16Str) {
    			            // Shortcut
    			            var utf16StrLength = utf16Str.length;

    			            // Convert
    			            var words = [];
    			            for (var i = 0; i < utf16StrLength; i++) {
    			                words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << (16 - (i % 2) * 16));
    			            }

    			            return WordArray.create(words, utf16StrLength * 2);
    			        }
    			    };

    			    function swapEndian(word) {
    			        return ((word << 8) & 0xff00ff00) | ((word >>> 8) & 0x00ff00ff);
    			    }
    			}());


    			return CryptoJS.enc.Utf16;

    		}));
    } (encUtf16));
    	return encUtf16.exports;
    }

    var encBase64 = {exports: {}};

    var hasRequiredEncBase64;

    function requireEncBase64 () {
    	if (hasRequiredEncBase64) return encBase64.exports;
    	hasRequiredEncBase64 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var C_enc = C.enc;

    			    /**
    			     * Base64 encoding strategy.
    			     */
    			    C_enc.Base64 = {
    			        /**
    			         * Converts a word array to a Base64 string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @return {string} The Base64 string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
    			         */
    			        stringify: function (wordArray) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;
    			            var map = this._map;

    			            // Clamp excess bits
    			            wordArray.clamp();

    			            // Convert
    			            var base64Chars = [];
    			            for (var i = 0; i < sigBytes; i += 3) {
    			                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
    			                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
    			                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

    			                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

    			                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
    			                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
    			                }
    			            }

    			            // Add padding
    			            var paddingChar = map.charAt(64);
    			            if (paddingChar) {
    			                while (base64Chars.length % 4) {
    			                    base64Chars.push(paddingChar);
    			                }
    			            }

    			            return base64Chars.join('');
    			        },

    			        /**
    			         * Converts a Base64 string to a word array.
    			         *
    			         * @param {string} base64Str The Base64 string.
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
    			         */
    			        parse: function (base64Str) {
    			            // Shortcuts
    			            var base64StrLength = base64Str.length;
    			            var map = this._map;
    			            var reverseMap = this._reverseMap;

    			            if (!reverseMap) {
    			                    reverseMap = this._reverseMap = [];
    			                    for (var j = 0; j < map.length; j++) {
    			                        reverseMap[map.charCodeAt(j)] = j;
    			                    }
    			            }

    			            // Ignore padding
    			            var paddingChar = map.charAt(64);
    			            if (paddingChar) {
    			                var paddingIndex = base64Str.indexOf(paddingChar);
    			                if (paddingIndex !== -1) {
    			                    base64StrLength = paddingIndex;
    			                }
    			            }

    			            // Convert
    			            return parseLoop(base64Str, base64StrLength, reverseMap);

    			        },

    			        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    			    };

    			    function parseLoop(base64Str, base64StrLength, reverseMap) {
    			      var words = [];
    			      var nBytes = 0;
    			      for (var i = 0; i < base64StrLength; i++) {
    			          if (i % 4) {
    			              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
    			              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
    			              var bitsCombined = bits1 | bits2;
    			              words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
    			              nBytes++;
    			          }
    			      }
    			      return WordArray.create(words, nBytes);
    			    }
    			}());


    			return CryptoJS.enc.Base64;

    		}));
    } (encBase64));
    	return encBase64.exports;
    }

    var encBase64url = {exports: {}};

    var hasRequiredEncBase64url;

    function requireEncBase64url () {
    	if (hasRequiredEncBase64url) return encBase64url.exports;
    	hasRequiredEncBase64url = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var C_enc = C.enc;

    			    /**
    			     * Base64url encoding strategy.
    			     */
    			    C_enc.Base64url = {
    			        /**
    			         * Converts a word array to a Base64url string.
    			         *
    			         * @param {WordArray} wordArray The word array.
    			         *
    			         * @param {boolean} urlSafe Whether to use url safe
    			         *
    			         * @return {string} The Base64url string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
    			         */
    			        stringify: function (wordArray, urlSafe=true) {
    			            // Shortcuts
    			            var words = wordArray.words;
    			            var sigBytes = wordArray.sigBytes;
    			            var map = urlSafe ? this._safe_map : this._map;

    			            // Clamp excess bits
    			            wordArray.clamp();

    			            // Convert
    			            var base64Chars = [];
    			            for (var i = 0; i < sigBytes; i += 3) {
    			                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
    			                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
    			                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

    			                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

    			                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
    			                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
    			                }
    			            }

    			            // Add padding
    			            var paddingChar = map.charAt(64);
    			            if (paddingChar) {
    			                while (base64Chars.length % 4) {
    			                    base64Chars.push(paddingChar);
    			                }
    			            }

    			            return base64Chars.join('');
    			        },

    			        /**
    			         * Converts a Base64url string to a word array.
    			         *
    			         * @param {string} base64Str The Base64url string.
    			         *
    			         * @param {boolean} urlSafe Whether to use url safe
    			         *
    			         * @return {WordArray} The word array.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
    			         */
    			        parse: function (base64Str, urlSafe=true) {
    			            // Shortcuts
    			            var base64StrLength = base64Str.length;
    			            var map = urlSafe ? this._safe_map : this._map;
    			            var reverseMap = this._reverseMap;

    			            if (!reverseMap) {
    			                reverseMap = this._reverseMap = [];
    			                for (var j = 0; j < map.length; j++) {
    			                    reverseMap[map.charCodeAt(j)] = j;
    			                }
    			            }

    			            // Ignore padding
    			            var paddingChar = map.charAt(64);
    			            if (paddingChar) {
    			                var paddingIndex = base64Str.indexOf(paddingChar);
    			                if (paddingIndex !== -1) {
    			                    base64StrLength = paddingIndex;
    			                }
    			            }

    			            // Convert
    			            return parseLoop(base64Str, base64StrLength, reverseMap);

    			        },

    			        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    			        _safe_map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
    			    };

    			    function parseLoop(base64Str, base64StrLength, reverseMap) {
    			        var words = [];
    			        var nBytes = 0;
    			        for (var i = 0; i < base64StrLength; i++) {
    			            if (i % 4) {
    			                var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
    			                var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
    			                var bitsCombined = bits1 | bits2;
    			                words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
    			                nBytes++;
    			            }
    			        }
    			        return WordArray.create(words, nBytes);
    			    }
    			}());

    			return CryptoJS.enc.Base64url;

    		}));
    } (encBase64url));
    	return encBase64url.exports;
    }

    var md5 = {exports: {}};

    var hasRequiredMd5;

    function requireMd5 () {
    	if (hasRequiredMd5) return md5.exports;
    	hasRequiredMd5 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (Math) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_algo = C.algo;

    			    // Constants table
    			    var T = [];

    			    // Compute constants
    			    (function () {
    			        for (var i = 0; i < 64; i++) {
    			            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
    			        }
    			    }());

    			    /**
    			     * MD5 hash algorithm.
    			     */
    			    var MD5 = C_algo.MD5 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash = new WordArray.init([
    			                0x67452301, 0xefcdab89,
    			                0x98badcfe, 0x10325476
    			            ]);
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Swap endian
    			            for (var i = 0; i < 16; i++) {
    			                // Shortcuts
    			                var offset_i = offset + i;
    			                var M_offset_i = M[offset_i];

    			                M[offset_i] = (
    			                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
    			                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
    			                );
    			            }

    			            // Shortcuts
    			            var H = this._hash.words;

    			            var M_offset_0  = M[offset + 0];
    			            var M_offset_1  = M[offset + 1];
    			            var M_offset_2  = M[offset + 2];
    			            var M_offset_3  = M[offset + 3];
    			            var M_offset_4  = M[offset + 4];
    			            var M_offset_5  = M[offset + 5];
    			            var M_offset_6  = M[offset + 6];
    			            var M_offset_7  = M[offset + 7];
    			            var M_offset_8  = M[offset + 8];
    			            var M_offset_9  = M[offset + 9];
    			            var M_offset_10 = M[offset + 10];
    			            var M_offset_11 = M[offset + 11];
    			            var M_offset_12 = M[offset + 12];
    			            var M_offset_13 = M[offset + 13];
    			            var M_offset_14 = M[offset + 14];
    			            var M_offset_15 = M[offset + 15];

    			            // Working varialbes
    			            var a = H[0];
    			            var b = H[1];
    			            var c = H[2];
    			            var d = H[3];

    			            // Computation
    			            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
    			            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
    			            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
    			            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
    			            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
    			            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
    			            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
    			            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
    			            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
    			            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
    			            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
    			            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
    			            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
    			            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
    			            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
    			            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

    			            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
    			            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
    			            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
    			            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
    			            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
    			            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
    			            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
    			            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
    			            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
    			            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
    			            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
    			            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
    			            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
    			            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
    			            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
    			            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

    			            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
    			            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
    			            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
    			            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
    			            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
    			            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
    			            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
    			            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
    			            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
    			            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
    			            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
    			            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
    			            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
    			            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
    			            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
    			            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

    			            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
    			            d = II(d, a, b, c, M_offset_7,  10, T[49]);
    			            c = II(c, d, a, b, M_offset_14, 15, T[50]);
    			            b = II(b, c, d, a, M_offset_5,  21, T[51]);
    			            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
    			            d = II(d, a, b, c, M_offset_3,  10, T[53]);
    			            c = II(c, d, a, b, M_offset_10, 15, T[54]);
    			            b = II(b, c, d, a, M_offset_1,  21, T[55]);
    			            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
    			            d = II(d, a, b, c, M_offset_15, 10, T[57]);
    			            c = II(c, d, a, b, M_offset_6,  15, T[58]);
    			            b = II(b, c, d, a, M_offset_13, 21, T[59]);
    			            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
    			            d = II(d, a, b, c, M_offset_11, 10, T[61]);
    			            c = II(c, d, a, b, M_offset_2,  15, T[62]);
    			            b = II(b, c, d, a, M_offset_9,  21, T[63]);

    			            // Intermediate hash value
    			            H[0] = (H[0] + a) | 0;
    			            H[1] = (H[1] + b) | 0;
    			            H[2] = (H[2] + c) | 0;
    			            H[3] = (H[3] + d) | 0;
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

    			            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
    			            var nBitsTotalL = nBitsTotal;
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
    			                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
    			                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
    			            );
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
    			                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
    			                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
    			            );

    			            data.sigBytes = (dataWords.length + 1) * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Shortcuts
    			            var hash = this._hash;
    			            var H = hash.words;

    			            // Swap endian
    			            for (var i = 0; i < 4; i++) {
    			                // Shortcut
    			                var H_i = H[i];

    			                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
    			                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
    			            }

    			            // Return final computed hash
    			            return hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        }
    			    });

    			    function FF(a, b, c, d, x, s, t) {
    			        var n = a + ((b & c) | (~b & d)) + x + t;
    			        return ((n << s) | (n >>> (32 - s))) + b;
    			    }

    			    function GG(a, b, c, d, x, s, t) {
    			        var n = a + ((b & d) | (c & ~d)) + x + t;
    			        return ((n << s) | (n >>> (32 - s))) + b;
    			    }

    			    function HH(a, b, c, d, x, s, t) {
    			        var n = a + (b ^ c ^ d) + x + t;
    			        return ((n << s) | (n >>> (32 - s))) + b;
    			    }

    			    function II(a, b, c, d, x, s, t) {
    			        var n = a + (c ^ (b | ~d)) + x + t;
    			        return ((n << s) | (n >>> (32 - s))) + b;
    			    }

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.MD5('message');
    			     *     var hash = CryptoJS.MD5(wordArray);
    			     */
    			    C.MD5 = Hasher._createHelper(MD5);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacMD5(message, key);
    			     */
    			    C.HmacMD5 = Hasher._createHmacHelper(MD5);
    			}(Math));


    			return CryptoJS.MD5;

    		}));
    } (md5));
    	return md5.exports;
    }

    var sha1 = {exports: {}};

    var hasRequiredSha1;

    function requireSha1 () {
    	if (hasRequiredSha1) return sha1.exports;
    	hasRequiredSha1 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_algo = C.algo;

    			    // Reusable object
    			    var W = [];

    			    /**
    			     * SHA-1 hash algorithm.
    			     */
    			    var SHA1 = C_algo.SHA1 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash = new WordArray.init([
    			                0x67452301, 0xefcdab89,
    			                0x98badcfe, 0x10325476,
    			                0xc3d2e1f0
    			            ]);
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcut
    			            var H = this._hash.words;

    			            // Working variables
    			            var a = H[0];
    			            var b = H[1];
    			            var c = H[2];
    			            var d = H[3];
    			            var e = H[4];

    			            // Computation
    			            for (var i = 0; i < 80; i++) {
    			                if (i < 16) {
    			                    W[i] = M[offset + i] | 0;
    			                } else {
    			                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
    			                    W[i] = (n << 1) | (n >>> 31);
    			                }

    			                var t = ((a << 5) | (a >>> 27)) + e + W[i];
    			                if (i < 20) {
    			                    t += ((b & c) | (~b & d)) + 0x5a827999;
    			                } else if (i < 40) {
    			                    t += (b ^ c ^ d) + 0x6ed9eba1;
    			                } else if (i < 60) {
    			                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
    			                } else /* if (i < 80) */ {
    			                    t += (b ^ c ^ d) - 0x359d3e2a;
    			                }

    			                e = d;
    			                d = c;
    			                c = (b << 30) | (b >>> 2);
    			                b = a;
    			                a = t;
    			            }

    			            // Intermediate hash value
    			            H[0] = (H[0] + a) | 0;
    			            H[1] = (H[1] + b) | 0;
    			            H[2] = (H[2] + c) | 0;
    			            H[3] = (H[3] + d) | 0;
    			            H[4] = (H[4] + e) | 0;
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
    			            data.sigBytes = dataWords.length * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Return final computed hash
    			            return this._hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA1('message');
    			     *     var hash = CryptoJS.SHA1(wordArray);
    			     */
    			    C.SHA1 = Hasher._createHelper(SHA1);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA1(message, key);
    			     */
    			    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
    			}());


    			return CryptoJS.SHA1;

    		}));
    } (sha1));
    	return sha1.exports;
    }

    var sha256 = {exports: {}};

    var hasRequiredSha256;

    function requireSha256 () {
    	if (hasRequiredSha256) return sha256.exports;
    	hasRequiredSha256 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (Math) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_algo = C.algo;

    			    // Initialization and round constants tables
    			    var H = [];
    			    var K = [];

    			    // Compute constants
    			    (function () {
    			        function isPrime(n) {
    			            var sqrtN = Math.sqrt(n);
    			            for (var factor = 2; factor <= sqrtN; factor++) {
    			                if (!(n % factor)) {
    			                    return false;
    			                }
    			            }

    			            return true;
    			        }

    			        function getFractionalBits(n) {
    			            return ((n - (n | 0)) * 0x100000000) | 0;
    			        }

    			        var n = 2;
    			        var nPrime = 0;
    			        while (nPrime < 64) {
    			            if (isPrime(n)) {
    			                if (nPrime < 8) {
    			                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
    			                }
    			                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

    			                nPrime++;
    			            }

    			            n++;
    			        }
    			    }());

    			    // Reusable object
    			    var W = [];

    			    /**
    			     * SHA-256 hash algorithm.
    			     */
    			    var SHA256 = C_algo.SHA256 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash = new WordArray.init(H.slice(0));
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcut
    			            var H = this._hash.words;

    			            // Working variables
    			            var a = H[0];
    			            var b = H[1];
    			            var c = H[2];
    			            var d = H[3];
    			            var e = H[4];
    			            var f = H[5];
    			            var g = H[6];
    			            var h = H[7];

    			            // Computation
    			            for (var i = 0; i < 64; i++) {
    			                if (i < 16) {
    			                    W[i] = M[offset + i] | 0;
    			                } else {
    			                    var gamma0x = W[i - 15];
    			                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
    			                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
    			                                   (gamma0x >>> 3);

    			                    var gamma1x = W[i - 2];
    			                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
    			                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
    			                                   (gamma1x >>> 10);

    			                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
    			                }

    			                var ch  = (e & f) ^ (~e & g);
    			                var maj = (a & b) ^ (a & c) ^ (b & c);

    			                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
    			                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

    			                var t1 = h + sigma1 + ch + K[i] + W[i];
    			                var t2 = sigma0 + maj;

    			                h = g;
    			                g = f;
    			                f = e;
    			                e = (d + t1) | 0;
    			                d = c;
    			                c = b;
    			                b = a;
    			                a = (t1 + t2) | 0;
    			            }

    			            // Intermediate hash value
    			            H[0] = (H[0] + a) | 0;
    			            H[1] = (H[1] + b) | 0;
    			            H[2] = (H[2] + c) | 0;
    			            H[3] = (H[3] + d) | 0;
    			            H[4] = (H[4] + e) | 0;
    			            H[5] = (H[5] + f) | 0;
    			            H[6] = (H[6] + g) | 0;
    			            H[7] = (H[7] + h) | 0;
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
    			            data.sigBytes = dataWords.length * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Return final computed hash
    			            return this._hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA256('message');
    			     *     var hash = CryptoJS.SHA256(wordArray);
    			     */
    			    C.SHA256 = Hasher._createHelper(SHA256);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA256(message, key);
    			     */
    			    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
    			}(Math));


    			return CryptoJS.SHA256;

    		}));
    } (sha256));
    	return sha256.exports;
    }

    var sha224 = {exports: {}};

    var hasRequiredSha224;

    function requireSha224 () {
    	if (hasRequiredSha224) return sha224.exports;
    	hasRequiredSha224 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireSha256());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var C_algo = C.algo;
    			    var SHA256 = C_algo.SHA256;

    			    /**
    			     * SHA-224 hash algorithm.
    			     */
    			    var SHA224 = C_algo.SHA224 = SHA256.extend({
    			        _doReset: function () {
    			            this._hash = new WordArray.init([
    			                0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
    			                0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
    			            ]);
    			        },

    			        _doFinalize: function () {
    			            var hash = SHA256._doFinalize.call(this);

    			            hash.sigBytes -= 4;

    			            return hash;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA224('message');
    			     *     var hash = CryptoJS.SHA224(wordArray);
    			     */
    			    C.SHA224 = SHA256._createHelper(SHA224);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA224(message, key);
    			     */
    			    C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
    			}());


    			return CryptoJS.SHA224;

    		}));
    } (sha224));
    	return sha224.exports;
    }

    var sha512 = {exports: {}};

    var hasRequiredSha512;

    function requireSha512 () {
    	if (hasRequiredSha512) return sha512.exports;
    	hasRequiredSha512 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireX64Core());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Hasher = C_lib.Hasher;
    			    var C_x64 = C.x64;
    			    var X64Word = C_x64.Word;
    			    var X64WordArray = C_x64.WordArray;
    			    var C_algo = C.algo;

    			    function X64Word_create() {
    			        return X64Word.create.apply(X64Word, arguments);
    			    }

    			    // Constants
    			    var K = [
    			        X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
    			        X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
    			        X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
    			        X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
    			        X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
    			        X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
    			        X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
    			        X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
    			        X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
    			        X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
    			        X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
    			        X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
    			        X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
    			        X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
    			        X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
    			        X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
    			        X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
    			        X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
    			        X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
    			        X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
    			        X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
    			        X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
    			        X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
    			        X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
    			        X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
    			        X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
    			        X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
    			        X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
    			        X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
    			        X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
    			        X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
    			        X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
    			        X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
    			        X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
    			        X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
    			        X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
    			        X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
    			        X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
    			        X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
    			        X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
    			    ];

    			    // Reusable objects
    			    var W = [];
    			    (function () {
    			        for (var i = 0; i < 80; i++) {
    			            W[i] = X64Word_create();
    			        }
    			    }());

    			    /**
    			     * SHA-512 hash algorithm.
    			     */
    			    var SHA512 = C_algo.SHA512 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash = new X64WordArray.init([
    			                new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b),
    			                new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1),
    			                new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f),
    			                new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)
    			            ]);
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcuts
    			            var H = this._hash.words;

    			            var H0 = H[0];
    			            var H1 = H[1];
    			            var H2 = H[2];
    			            var H3 = H[3];
    			            var H4 = H[4];
    			            var H5 = H[5];
    			            var H6 = H[6];
    			            var H7 = H[7];

    			            var H0h = H0.high;
    			            var H0l = H0.low;
    			            var H1h = H1.high;
    			            var H1l = H1.low;
    			            var H2h = H2.high;
    			            var H2l = H2.low;
    			            var H3h = H3.high;
    			            var H3l = H3.low;
    			            var H4h = H4.high;
    			            var H4l = H4.low;
    			            var H5h = H5.high;
    			            var H5l = H5.low;
    			            var H6h = H6.high;
    			            var H6l = H6.low;
    			            var H7h = H7.high;
    			            var H7l = H7.low;

    			            // Working variables
    			            var ah = H0h;
    			            var al = H0l;
    			            var bh = H1h;
    			            var bl = H1l;
    			            var ch = H2h;
    			            var cl = H2l;
    			            var dh = H3h;
    			            var dl = H3l;
    			            var eh = H4h;
    			            var el = H4l;
    			            var fh = H5h;
    			            var fl = H5l;
    			            var gh = H6h;
    			            var gl = H6l;
    			            var hh = H7h;
    			            var hl = H7l;

    			            // Rounds
    			            for (var i = 0; i < 80; i++) {
    			                var Wil;
    			                var Wih;

    			                // Shortcut
    			                var Wi = W[i];

    			                // Extend message
    			                if (i < 16) {
    			                    Wih = Wi.high = M[offset + i * 2]     | 0;
    			                    Wil = Wi.low  = M[offset + i * 2 + 1] | 0;
    			                } else {
    			                    // Gamma0
    			                    var gamma0x  = W[i - 15];
    			                    var gamma0xh = gamma0x.high;
    			                    var gamma0xl = gamma0x.low;
    			                    var gamma0h  = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
    			                    var gamma0l  = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25));

    			                    // Gamma1
    			                    var gamma1x  = W[i - 2];
    			                    var gamma1xh = gamma1x.high;
    			                    var gamma1xl = gamma1x.low;
    			                    var gamma1h  = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
    			                    var gamma1l  = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26));

    			                    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
    			                    var Wi7  = W[i - 7];
    			                    var Wi7h = Wi7.high;
    			                    var Wi7l = Wi7.low;

    			                    var Wi16  = W[i - 16];
    			                    var Wi16h = Wi16.high;
    			                    var Wi16l = Wi16.low;

    			                    Wil = gamma0l + Wi7l;
    			                    Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
    			                    Wil = Wil + gamma1l;
    			                    Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
    			                    Wil = Wil + Wi16l;
    			                    Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

    			                    Wi.high = Wih;
    			                    Wi.low  = Wil;
    			                }

    			                var chh  = (eh & fh) ^ (~eh & gh);
    			                var chl  = (el & fl) ^ (~el & gl);
    			                var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
    			                var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

    			                var sigma0h = ((ah >>> 28) | (al << 4))  ^ ((ah << 30)  | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
    			                var sigma0l = ((al >>> 28) | (ah << 4))  ^ ((al << 30)  | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
    			                var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
    			                var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

    			                // t1 = h + sigma1 + ch + K[i] + W[i]
    			                var Ki  = K[i];
    			                var Kih = Ki.high;
    			                var Kil = Ki.low;

    			                var t1l = hl + sigma1l;
    			                var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
    			                var t1l = t1l + chl;
    			                var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
    			                var t1l = t1l + Kil;
    			                var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
    			                var t1l = t1l + Wil;
    			                var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

    			                // t2 = sigma0 + maj
    			                var t2l = sigma0l + majl;
    			                var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

    			                // Update working variables
    			                hh = gh;
    			                hl = gl;
    			                gh = fh;
    			                gl = fl;
    			                fh = eh;
    			                fl = el;
    			                el = (dl + t1l) | 0;
    			                eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
    			                dh = ch;
    			                dl = cl;
    			                ch = bh;
    			                cl = bl;
    			                bh = ah;
    			                bl = al;
    			                al = (t1l + t2l) | 0;
    			                ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
    			            }

    			            // Intermediate hash value
    			            H0l = H0.low  = (H0l + al);
    			            H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0));
    			            H1l = H1.low  = (H1l + bl);
    			            H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0));
    			            H2l = H2.low  = (H2l + cl);
    			            H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0));
    			            H3l = H3.low  = (H3l + dl);
    			            H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0));
    			            H4l = H4.low  = (H4l + el);
    			            H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0));
    			            H5l = H5.low  = (H5l + fl);
    			            H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0));
    			            H6l = H6.low  = (H6l + gl);
    			            H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0));
    			            H7l = H7.low  = (H7l + hl);
    			            H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0));
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    			            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
    			            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
    			            data.sigBytes = dataWords.length * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Convert hash to 32-bit word array before returning
    			            var hash = this._hash.toX32();

    			            // Return final computed hash
    			            return hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        },

    			        blockSize: 1024/32
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA512('message');
    			     *     var hash = CryptoJS.SHA512(wordArray);
    			     */
    			    C.SHA512 = Hasher._createHelper(SHA512);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA512(message, key);
    			     */
    			    C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
    			}());


    			return CryptoJS.SHA512;

    		}));
    } (sha512));
    	return sha512.exports;
    }

    var sha384 = {exports: {}};

    var hasRequiredSha384;

    function requireSha384 () {
    	if (hasRequiredSha384) return sha384.exports;
    	hasRequiredSha384 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireX64Core(), requireSha512());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_x64 = C.x64;
    			    var X64Word = C_x64.Word;
    			    var X64WordArray = C_x64.WordArray;
    			    var C_algo = C.algo;
    			    var SHA512 = C_algo.SHA512;

    			    /**
    			     * SHA-384 hash algorithm.
    			     */
    			    var SHA384 = C_algo.SHA384 = SHA512.extend({
    			        _doReset: function () {
    			            this._hash = new X64WordArray.init([
    			                new X64Word.init(0xcbbb9d5d, 0xc1059ed8), new X64Word.init(0x629a292a, 0x367cd507),
    			                new X64Word.init(0x9159015a, 0x3070dd17), new X64Word.init(0x152fecd8, 0xf70e5939),
    			                new X64Word.init(0x67332667, 0xffc00b31), new X64Word.init(0x8eb44a87, 0x68581511),
    			                new X64Word.init(0xdb0c2e0d, 0x64f98fa7), new X64Word.init(0x47b5481d, 0xbefa4fa4)
    			            ]);
    			        },

    			        _doFinalize: function () {
    			            var hash = SHA512._doFinalize.call(this);

    			            hash.sigBytes -= 16;

    			            return hash;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA384('message');
    			     *     var hash = CryptoJS.SHA384(wordArray);
    			     */
    			    C.SHA384 = SHA512._createHelper(SHA384);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA384(message, key);
    			     */
    			    C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
    			}());


    			return CryptoJS.SHA384;

    		}));
    } (sha384));
    	return sha384.exports;
    }

    var sha3 = {exports: {}};

    var hasRequiredSha3;

    function requireSha3 () {
    	if (hasRequiredSha3) return sha3.exports;
    	hasRequiredSha3 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireX64Core());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (Math) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_x64 = C.x64;
    			    var X64Word = C_x64.Word;
    			    var C_algo = C.algo;

    			    // Constants tables
    			    var RHO_OFFSETS = [];
    			    var PI_INDEXES  = [];
    			    var ROUND_CONSTANTS = [];

    			    // Compute Constants
    			    (function () {
    			        // Compute rho offset constants
    			        var x = 1, y = 0;
    			        for (var t = 0; t < 24; t++) {
    			            RHO_OFFSETS[x + 5 * y] = ((t + 1) * (t + 2) / 2) % 64;

    			            var newX = y % 5;
    			            var newY = (2 * x + 3 * y) % 5;
    			            x = newX;
    			            y = newY;
    			        }

    			        // Compute pi index constants
    			        for (var x = 0; x < 5; x++) {
    			            for (var y = 0; y < 5; y++) {
    			                PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5;
    			            }
    			        }

    			        // Compute round constants
    			        var LFSR = 0x01;
    			        for (var i = 0; i < 24; i++) {
    			            var roundConstantMsw = 0;
    			            var roundConstantLsw = 0;

    			            for (var j = 0; j < 7; j++) {
    			                if (LFSR & 0x01) {
    			                    var bitPosition = (1 << j) - 1;
    			                    if (bitPosition < 32) {
    			                        roundConstantLsw ^= 1 << bitPosition;
    			                    } else /* if (bitPosition >= 32) */ {
    			                        roundConstantMsw ^= 1 << (bitPosition - 32);
    			                    }
    			                }

    			                // Compute next LFSR
    			                if (LFSR & 0x80) {
    			                    // Primitive polynomial over GF(2): x^8 + x^6 + x^5 + x^4 + 1
    			                    LFSR = (LFSR << 1) ^ 0x71;
    			                } else {
    			                    LFSR <<= 1;
    			                }
    			            }

    			            ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
    			        }
    			    }());

    			    // Reusable objects for temporary values
    			    var T = [];
    			    (function () {
    			        for (var i = 0; i < 25; i++) {
    			            T[i] = X64Word.create();
    			        }
    			    }());

    			    /**
    			     * SHA-3 hash algorithm.
    			     */
    			    var SHA3 = C_algo.SHA3 = Hasher.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {number} outputLength
    			         *   The desired number of bits in the output hash.
    			         *   Only values permitted are: 224, 256, 384, 512.
    			         *   Default: 512
    			         */
    			        cfg: Hasher.cfg.extend({
    			            outputLength: 512
    			        }),

    			        _doReset: function () {
    			            var state = this._state = [];
    			            for (var i = 0; i < 25; i++) {
    			                state[i] = new X64Word.init();
    			            }

    			            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcuts
    			            var state = this._state;
    			            var nBlockSizeLanes = this.blockSize / 2;

    			            // Absorb
    			            for (var i = 0; i < nBlockSizeLanes; i++) {
    			                // Shortcuts
    			                var M2i  = M[offset + 2 * i];
    			                var M2i1 = M[offset + 2 * i + 1];

    			                // Swap endian
    			                M2i = (
    			                    (((M2i << 8)  | (M2i >>> 24)) & 0x00ff00ff) |
    			                    (((M2i << 24) | (M2i >>> 8))  & 0xff00ff00)
    			                );
    			                M2i1 = (
    			                    (((M2i1 << 8)  | (M2i1 >>> 24)) & 0x00ff00ff) |
    			                    (((M2i1 << 24) | (M2i1 >>> 8))  & 0xff00ff00)
    			                );

    			                // Absorb message into state
    			                var lane = state[i];
    			                lane.high ^= M2i1;
    			                lane.low  ^= M2i;
    			            }

    			            // Rounds
    			            for (var round = 0; round < 24; round++) {
    			                // Theta
    			                for (var x = 0; x < 5; x++) {
    			                    // Mix column lanes
    			                    var tMsw = 0, tLsw = 0;
    			                    for (var y = 0; y < 5; y++) {
    			                        var lane = state[x + 5 * y];
    			                        tMsw ^= lane.high;
    			                        tLsw ^= lane.low;
    			                    }

    			                    // Temporary values
    			                    var Tx = T[x];
    			                    Tx.high = tMsw;
    			                    Tx.low  = tLsw;
    			                }
    			                for (var x = 0; x < 5; x++) {
    			                    // Shortcuts
    			                    var Tx4 = T[(x + 4) % 5];
    			                    var Tx1 = T[(x + 1) % 5];
    			                    var Tx1Msw = Tx1.high;
    			                    var Tx1Lsw = Tx1.low;

    			                    // Mix surrounding columns
    			                    var tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31));
    			                    var tLsw = Tx4.low  ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31));
    			                    for (var y = 0; y < 5; y++) {
    			                        var lane = state[x + 5 * y];
    			                        lane.high ^= tMsw;
    			                        lane.low  ^= tLsw;
    			                    }
    			                }

    			                // Rho Pi
    			                for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
    			                    var tMsw;
    			                    var tLsw;

    			                    // Shortcuts
    			                    var lane = state[laneIndex];
    			                    var laneMsw = lane.high;
    			                    var laneLsw = lane.low;
    			                    var rhoOffset = RHO_OFFSETS[laneIndex];

    			                    // Rotate lanes
    			                    if (rhoOffset < 32) {
    			                        tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset));
    			                        tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset));
    			                    } else /* if (rhoOffset >= 32) */ {
    			                        tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset));
    			                        tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset));
    			                    }

    			                    // Transpose lanes
    			                    var TPiLane = T[PI_INDEXES[laneIndex]];
    			                    TPiLane.high = tMsw;
    			                    TPiLane.low  = tLsw;
    			                }

    			                // Rho pi at x = y = 0
    			                var T0 = T[0];
    			                var state0 = state[0];
    			                T0.high = state0.high;
    			                T0.low  = state0.low;

    			                // Chi
    			                for (var x = 0; x < 5; x++) {
    			                    for (var y = 0; y < 5; y++) {
    			                        // Shortcuts
    			                        var laneIndex = x + 5 * y;
    			                        var lane = state[laneIndex];
    			                        var TLane = T[laneIndex];
    			                        var Tx1Lane = T[((x + 1) % 5) + 5 * y];
    			                        var Tx2Lane = T[((x + 2) % 5) + 5 * y];

    			                        // Mix rows
    			                        lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high);
    			                        lane.low  = TLane.low  ^ (~Tx1Lane.low  & Tx2Lane.low);
    			                    }
    			                }

    			                // Iota
    			                var lane = state[0];
    			                var roundConstant = ROUND_CONSTANTS[round];
    			                lane.high ^= roundConstant.high;
    			                lane.low  ^= roundConstant.low;
    			            }
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;
    			            this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;
    			            var blockSizeBits = this.blockSize * 32;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - nBitsLeft % 32);
    			            dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80;
    			            data.sigBytes = dataWords.length * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Shortcuts
    			            var state = this._state;
    			            var outputLengthBytes = this.cfg.outputLength / 8;
    			            var outputLengthLanes = outputLengthBytes / 8;

    			            // Squeeze
    			            var hashWords = [];
    			            for (var i = 0; i < outputLengthLanes; i++) {
    			                // Shortcuts
    			                var lane = state[i];
    			                var laneMsw = lane.high;
    			                var laneLsw = lane.low;

    			                // Swap endian
    			                laneMsw = (
    			                    (((laneMsw << 8)  | (laneMsw >>> 24)) & 0x00ff00ff) |
    			                    (((laneMsw << 24) | (laneMsw >>> 8))  & 0xff00ff00)
    			                );
    			                laneLsw = (
    			                    (((laneLsw << 8)  | (laneLsw >>> 24)) & 0x00ff00ff) |
    			                    (((laneLsw << 24) | (laneLsw >>> 8))  & 0xff00ff00)
    			                );

    			                // Squeeze state to retrieve hash
    			                hashWords.push(laneLsw);
    			                hashWords.push(laneMsw);
    			            }

    			            // Return final computed hash
    			            return new WordArray.init(hashWords, outputLengthBytes);
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);

    			            var state = clone._state = this._state.slice(0);
    			            for (var i = 0; i < 25; i++) {
    			                state[i] = state[i].clone();
    			            }

    			            return clone;
    			        }
    			    });

    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.SHA3('message');
    			     *     var hash = CryptoJS.SHA3(wordArray);
    			     */
    			    C.SHA3 = Hasher._createHelper(SHA3);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacSHA3(message, key);
    			     */
    			    C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
    			}(Math));


    			return CryptoJS.SHA3;

    		}));
    } (sha3));
    	return sha3.exports;
    }

    var ripemd160 = {exports: {}};

    var hasRequiredRipemd160;

    function requireRipemd160 () {
    	if (hasRequiredRipemd160) return ripemd160.exports;
    	hasRequiredRipemd160 = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/** @preserve
    			(c) 2012 by Cédric Mesnil. All rights reserved.

    			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    			    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    			    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

    			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    			*/

    			(function (Math) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var Hasher = C_lib.Hasher;
    			    var C_algo = C.algo;

    			    // Constants table
    			    var _zl = WordArray.create([
    			        0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
    			        7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
    			        3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
    			        1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
    			        4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13]);
    			    var _zr = WordArray.create([
    			        5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
    			        6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
    			        15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
    			        8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
    			        12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11]);
    			    var _sl = WordArray.create([
    			         11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
    			        7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
    			        11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
    			          11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
    			        9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ]);
    			    var _sr = WordArray.create([
    			        8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
    			        9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
    			        9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
    			        15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
    			        8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ]);

    			    var _hl =  WordArray.create([ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E]);
    			    var _hr =  WordArray.create([ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000]);

    			    /**
    			     * RIPEMD160 hash algorithm.
    			     */
    			    var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
    			        _doReset: function () {
    			            this._hash  = WordArray.create([0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0]);
    			        },

    			        _doProcessBlock: function (M, offset) {

    			            // Swap endian
    			            for (var i = 0; i < 16; i++) {
    			                // Shortcuts
    			                var offset_i = offset + i;
    			                var M_offset_i = M[offset_i];

    			                // Swap
    			                M[offset_i] = (
    			                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
    			                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
    			                );
    			            }
    			            // Shortcut
    			            var H  = this._hash.words;
    			            var hl = _hl.words;
    			            var hr = _hr.words;
    			            var zl = _zl.words;
    			            var zr = _zr.words;
    			            var sl = _sl.words;
    			            var sr = _sr.words;

    			            // Working variables
    			            var al, bl, cl, dl, el;
    			            var ar, br, cr, dr, er;

    			            ar = al = H[0];
    			            br = bl = H[1];
    			            cr = cl = H[2];
    			            dr = dl = H[3];
    			            er = el = H[4];
    			            // Computation
    			            var t;
    			            for (var i = 0; i < 80; i += 1) {
    			                t = (al +  M[offset+zl[i]])|0;
    			                if (i<16){
    				            t +=  f1(bl,cl,dl) + hl[0];
    			                } else if (i<32) {
    				            t +=  f2(bl,cl,dl) + hl[1];
    			                } else if (i<48) {
    				            t +=  f3(bl,cl,dl) + hl[2];
    			                } else if (i<64) {
    				            t +=  f4(bl,cl,dl) + hl[3];
    			                } else {// if (i<80) {
    				            t +=  f5(bl,cl,dl) + hl[4];
    			                }
    			                t = t|0;
    			                t =  rotl(t,sl[i]);
    			                t = (t+el)|0;
    			                al = el;
    			                el = dl;
    			                dl = rotl(cl, 10);
    			                cl = bl;
    			                bl = t;

    			                t = (ar + M[offset+zr[i]])|0;
    			                if (i<16){
    				            t +=  f5(br,cr,dr) + hr[0];
    			                } else if (i<32) {
    				            t +=  f4(br,cr,dr) + hr[1];
    			                } else if (i<48) {
    				            t +=  f3(br,cr,dr) + hr[2];
    			                } else if (i<64) {
    				            t +=  f2(br,cr,dr) + hr[3];
    			                } else {// if (i<80) {
    				            t +=  f1(br,cr,dr) + hr[4];
    			                }
    			                t = t|0;
    			                t =  rotl(t,sr[i]) ;
    			                t = (t+er)|0;
    			                ar = er;
    			                er = dr;
    			                dr = rotl(cr, 10);
    			                cr = br;
    			                br = t;
    			            }
    			            // Intermediate hash value
    			            t    = (H[1] + cl + dr)|0;
    			            H[1] = (H[2] + dl + er)|0;
    			            H[2] = (H[3] + el + ar)|0;
    			            H[3] = (H[4] + al + br)|0;
    			            H[4] = (H[0] + bl + cr)|0;
    			            H[0] =  t;
    			        },

    			        _doFinalize: function () {
    			            // Shortcuts
    			            var data = this._data;
    			            var dataWords = data.words;

    			            var nBitsTotal = this._nDataBytes * 8;
    			            var nBitsLeft = data.sigBytes * 8;

    			            // Add padding
    			            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    			            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
    			                (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
    			                (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
    			            );
    			            data.sigBytes = (dataWords.length + 1) * 4;

    			            // Hash final blocks
    			            this._process();

    			            // Shortcuts
    			            var hash = this._hash;
    			            var H = hash.words;

    			            // Swap endian
    			            for (var i = 0; i < 5; i++) {
    			                // Shortcut
    			                var H_i = H[i];

    			                // Swap
    			                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
    			                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
    			            }

    			            // Return final computed hash
    			            return hash;
    			        },

    			        clone: function () {
    			            var clone = Hasher.clone.call(this);
    			            clone._hash = this._hash.clone();

    			            return clone;
    			        }
    			    });


    			    function f1(x, y, z) {
    			        return ((x) ^ (y) ^ (z));

    			    }

    			    function f2(x, y, z) {
    			        return (((x)&(y)) | ((~x)&(z)));
    			    }

    			    function f3(x, y, z) {
    			        return (((x) | (~(y))) ^ (z));
    			    }

    			    function f4(x, y, z) {
    			        return (((x) & (z)) | ((y)&(~(z))));
    			    }

    			    function f5(x, y, z) {
    			        return ((x) ^ ((y) |(~(z))));

    			    }

    			    function rotl(x,n) {
    			        return (x<<n) | (x>>>(32-n));
    			    }


    			    /**
    			     * Shortcut function to the hasher's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     *
    			     * @return {WordArray} The hash.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hash = CryptoJS.RIPEMD160('message');
    			     *     var hash = CryptoJS.RIPEMD160(wordArray);
    			     */
    			    C.RIPEMD160 = Hasher._createHelper(RIPEMD160);

    			    /**
    			     * Shortcut function to the HMAC's object interface.
    			     *
    			     * @param {WordArray|string} message The message to hash.
    			     * @param {WordArray|string} key The secret key.
    			     *
    			     * @return {WordArray} The HMAC.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var hmac = CryptoJS.HmacRIPEMD160(message, key);
    			     */
    			    C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
    			}());


    			return CryptoJS.RIPEMD160;

    		}));
    } (ripemd160));
    	return ripemd160.exports;
    }

    var hmac = {exports: {}};

    var hasRequiredHmac;

    function requireHmac () {
    	if (hasRequiredHmac) return hmac.exports;
    	hasRequiredHmac = 1;
    	(function (module, exports) {
    (function (root, factory) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var C_enc = C.enc;
    			    var Utf8 = C_enc.Utf8;
    			    var C_algo = C.algo;

    			    /**
    			     * HMAC algorithm.
    			     */
    			    C_algo.HMAC = Base.extend({
    			        /**
    			         * Initializes a newly created HMAC.
    			         *
    			         * @param {Hasher} hasher The hash algorithm to use.
    			         * @param {WordArray|string} key The secret key.
    			         *
    			         * @example
    			         *
    			         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
    			         */
    			        init: function (hasher, key) {
    			            // Init hasher
    			            hasher = this._hasher = new hasher.init();

    			            // Convert string to WordArray, else assume WordArray already
    			            if (typeof key == 'string') {
    			                key = Utf8.parse(key);
    			            }

    			            // Shortcuts
    			            var hasherBlockSize = hasher.blockSize;
    			            var hasherBlockSizeBytes = hasherBlockSize * 4;

    			            // Allow arbitrary length keys
    			            if (key.sigBytes > hasherBlockSizeBytes) {
    			                key = hasher.finalize(key);
    			            }

    			            // Clamp excess bits
    			            key.clamp();

    			            // Clone key for inner and outer pads
    			            var oKey = this._oKey = key.clone();
    			            var iKey = this._iKey = key.clone();

    			            // Shortcuts
    			            var oKeyWords = oKey.words;
    			            var iKeyWords = iKey.words;

    			            // XOR keys with pad constants
    			            for (var i = 0; i < hasherBlockSize; i++) {
    			                oKeyWords[i] ^= 0x5c5c5c5c;
    			                iKeyWords[i] ^= 0x36363636;
    			            }
    			            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

    			            // Set initial values
    			            this.reset();
    			        },

    			        /**
    			         * Resets this HMAC to its initial state.
    			         *
    			         * @example
    			         *
    			         *     hmacHasher.reset();
    			         */
    			        reset: function () {
    			            // Shortcut
    			            var hasher = this._hasher;

    			            // Reset
    			            hasher.reset();
    			            hasher.update(this._iKey);
    			        },

    			        /**
    			         * Updates this HMAC with a message.
    			         *
    			         * @param {WordArray|string} messageUpdate The message to append.
    			         *
    			         * @return {HMAC} This HMAC instance.
    			         *
    			         * @example
    			         *
    			         *     hmacHasher.update('message');
    			         *     hmacHasher.update(wordArray);
    			         */
    			        update: function (messageUpdate) {
    			            this._hasher.update(messageUpdate);

    			            // Chainable
    			            return this;
    			        },

    			        /**
    			         * Finalizes the HMAC computation.
    			         * Note that the finalize operation is effectively a destructive, read-once operation.
    			         *
    			         * @param {WordArray|string} messageUpdate (Optional) A final message update.
    			         *
    			         * @return {WordArray} The HMAC.
    			         *
    			         * @example
    			         *
    			         *     var hmac = hmacHasher.finalize();
    			         *     var hmac = hmacHasher.finalize('message');
    			         *     var hmac = hmacHasher.finalize(wordArray);
    			         */
    			        finalize: function (messageUpdate) {
    			            // Shortcut
    			            var hasher = this._hasher;

    			            // Compute HMAC
    			            var innerHash = hasher.finalize(messageUpdate);
    			            hasher.reset();
    			            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

    			            return hmac;
    			        }
    			    });
    			}());


    		}));
    } (hmac));
    	return hmac.exports;
    }

    var pbkdf2 = {exports: {}};

    var hasRequiredPbkdf2;

    function requirePbkdf2 () {
    	if (hasRequiredPbkdf2) return pbkdf2.exports;
    	hasRequiredPbkdf2 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireSha1(), requireHmac());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var WordArray = C_lib.WordArray;
    			    var C_algo = C.algo;
    			    var SHA1 = C_algo.SHA1;
    			    var HMAC = C_algo.HMAC;

    			    /**
    			     * Password-Based Key Derivation Function 2 algorithm.
    			     */
    			    var PBKDF2 = C_algo.PBKDF2 = Base.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
    			         * @property {Hasher} hasher The hasher to use. Default: SHA1
    			         * @property {number} iterations The number of iterations to perform. Default: 1
    			         */
    			        cfg: Base.extend({
    			            keySize: 128/32,
    			            hasher: SHA1,
    			            iterations: 1
    			        }),

    			        /**
    			         * Initializes a newly created key derivation function.
    			         *
    			         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
    			         *
    			         * @example
    			         *
    			         *     var kdf = CryptoJS.algo.PBKDF2.create();
    			         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
    			         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
    			         */
    			        init: function (cfg) {
    			            this.cfg = this.cfg.extend(cfg);
    			        },

    			        /**
    			         * Computes the Password-Based Key Derivation Function 2.
    			         *
    			         * @param {WordArray|string} password The password.
    			         * @param {WordArray|string} salt A salt.
    			         *
    			         * @return {WordArray} The derived key.
    			         *
    			         * @example
    			         *
    			         *     var key = kdf.compute(password, salt);
    			         */
    			        compute: function (password, salt) {
    			            // Shortcut
    			            var cfg = this.cfg;

    			            // Init HMAC
    			            var hmac = HMAC.create(cfg.hasher, password);

    			            // Initial values
    			            var derivedKey = WordArray.create();
    			            var blockIndex = WordArray.create([0x00000001]);

    			            // Shortcuts
    			            var derivedKeyWords = derivedKey.words;
    			            var blockIndexWords = blockIndex.words;
    			            var keySize = cfg.keySize;
    			            var iterations = cfg.iterations;

    			            // Generate key
    			            while (derivedKeyWords.length < keySize) {
    			                var block = hmac.update(salt).finalize(blockIndex);
    			                hmac.reset();

    			                // Shortcuts
    			                var blockWords = block.words;
    			                var blockWordsLength = blockWords.length;

    			                // Iterations
    			                var intermediate = block;
    			                for (var i = 1; i < iterations; i++) {
    			                    intermediate = hmac.finalize(intermediate);
    			                    hmac.reset();

    			                    // Shortcut
    			                    var intermediateWords = intermediate.words;

    			                    // XOR intermediate with block
    			                    for (var j = 0; j < blockWordsLength; j++) {
    			                        blockWords[j] ^= intermediateWords[j];
    			                    }
    			                }

    			                derivedKey.concat(block);
    			                blockIndexWords[0]++;
    			            }
    			            derivedKey.sigBytes = keySize * 4;

    			            return derivedKey;
    			        }
    			    });

    			    /**
    			     * Computes the Password-Based Key Derivation Function 2.
    			     *
    			     * @param {WordArray|string} password The password.
    			     * @param {WordArray|string} salt A salt.
    			     * @param {Object} cfg (Optional) The configuration options to use for this computation.
    			     *
    			     * @return {WordArray} The derived key.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var key = CryptoJS.PBKDF2(password, salt);
    			     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
    			     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
    			     */
    			    C.PBKDF2 = function (password, salt, cfg) {
    			        return PBKDF2.create(cfg).compute(password, salt);
    			    };
    			}());


    			return CryptoJS.PBKDF2;

    		}));
    } (pbkdf2));
    	return pbkdf2.exports;
    }

    var evpkdf = {exports: {}};

    var hasRequiredEvpkdf;

    function requireEvpkdf () {
    	if (hasRequiredEvpkdf) return evpkdf.exports;
    	hasRequiredEvpkdf = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireSha1(), requireHmac());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var WordArray = C_lib.WordArray;
    			    var C_algo = C.algo;
    			    var MD5 = C_algo.MD5;

    			    /**
    			     * This key derivation function is meant to conform with EVP_BytesToKey.
    			     * www.openssl.org/docs/crypto/EVP_BytesToKey.html
    			     */
    			    var EvpKDF = C_algo.EvpKDF = Base.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
    			         * @property {Hasher} hasher The hash algorithm to use. Default: MD5
    			         * @property {number} iterations The number of iterations to perform. Default: 1
    			         */
    			        cfg: Base.extend({
    			            keySize: 128/32,
    			            hasher: MD5,
    			            iterations: 1
    			        }),

    			        /**
    			         * Initializes a newly created key derivation function.
    			         *
    			         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
    			         *
    			         * @example
    			         *
    			         *     var kdf = CryptoJS.algo.EvpKDF.create();
    			         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
    			         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
    			         */
    			        init: function (cfg) {
    			            this.cfg = this.cfg.extend(cfg);
    			        },

    			        /**
    			         * Derives a key from a password.
    			         *
    			         * @param {WordArray|string} password The password.
    			         * @param {WordArray|string} salt A salt.
    			         *
    			         * @return {WordArray} The derived key.
    			         *
    			         * @example
    			         *
    			         *     var key = kdf.compute(password, salt);
    			         */
    			        compute: function (password, salt) {
    			            var block;

    			            // Shortcut
    			            var cfg = this.cfg;

    			            // Init hasher
    			            var hasher = cfg.hasher.create();

    			            // Initial values
    			            var derivedKey = WordArray.create();

    			            // Shortcuts
    			            var derivedKeyWords = derivedKey.words;
    			            var keySize = cfg.keySize;
    			            var iterations = cfg.iterations;

    			            // Generate key
    			            while (derivedKeyWords.length < keySize) {
    			                if (block) {
    			                    hasher.update(block);
    			                }
    			                block = hasher.update(password).finalize(salt);
    			                hasher.reset();

    			                // Iterations
    			                for (var i = 1; i < iterations; i++) {
    			                    block = hasher.finalize(block);
    			                    hasher.reset();
    			                }

    			                derivedKey.concat(block);
    			            }
    			            derivedKey.sigBytes = keySize * 4;

    			            return derivedKey;
    			        }
    			    });

    			    /**
    			     * Derives a key from a password.
    			     *
    			     * @param {WordArray|string} password The password.
    			     * @param {WordArray|string} salt A salt.
    			     * @param {Object} cfg (Optional) The configuration options to use for this computation.
    			     *
    			     * @return {WordArray} The derived key.
    			     *
    			     * @static
    			     *
    			     * @example
    			     *
    			     *     var key = CryptoJS.EvpKDF(password, salt);
    			     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
    			     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
    			     */
    			    C.EvpKDF = function (password, salt, cfg) {
    			        return EvpKDF.create(cfg).compute(password, salt);
    			    };
    			}());


    			return CryptoJS.EvpKDF;

    		}));
    } (evpkdf));
    	return evpkdf.exports;
    }

    var cipherCore = {exports: {}};

    var hasRequiredCipherCore;

    function requireCipherCore () {
    	if (hasRequiredCipherCore) return cipherCore.exports;
    	hasRequiredCipherCore = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEvpkdf());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Cipher core components.
    			 */
    			CryptoJS.lib.Cipher || (function (undefined$1) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var Base = C_lib.Base;
    			    var WordArray = C_lib.WordArray;
    			    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
    			    var C_enc = C.enc;
    			    C_enc.Utf8;
    			    var Base64 = C_enc.Base64;
    			    var C_algo = C.algo;
    			    var EvpKDF = C_algo.EvpKDF;

    			    /**
    			     * Abstract base cipher template.
    			     *
    			     * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
    			     * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
    			     * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
    			     * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
    			     */
    			    var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {WordArray} iv The IV to use for this operation.
    			         */
    			        cfg: Base.extend(),

    			        /**
    			         * Creates this cipher in encryption mode.
    			         *
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {Cipher} A cipher instance.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
    			         */
    			        createEncryptor: function (key, cfg) {
    			            return this.create(this._ENC_XFORM_MODE, key, cfg);
    			        },

    			        /**
    			         * Creates this cipher in decryption mode.
    			         *
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {Cipher} A cipher instance.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
    			         */
    			        createDecryptor: function (key, cfg) {
    			            return this.create(this._DEC_XFORM_MODE, key, cfg);
    			        },

    			        /**
    			         * Initializes a newly created cipher.
    			         *
    			         * @param {number} xformMode Either the encryption or decryption transormation mode constant.
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @example
    			         *
    			         *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
    			         */
    			        init: function (xformMode, key, cfg) {
    			            // Apply config defaults
    			            this.cfg = this.cfg.extend(cfg);

    			            // Store transform mode and key
    			            this._xformMode = xformMode;
    			            this._key = key;

    			            // Set initial values
    			            this.reset();
    			        },

    			        /**
    			         * Resets this cipher to its initial state.
    			         *
    			         * @example
    			         *
    			         *     cipher.reset();
    			         */
    			        reset: function () {
    			            // Reset data buffer
    			            BufferedBlockAlgorithm.reset.call(this);

    			            // Perform concrete-cipher logic
    			            this._doReset();
    			        },

    			        /**
    			         * Adds data to be encrypted or decrypted.
    			         *
    			         * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
    			         *
    			         * @return {WordArray} The data after processing.
    			         *
    			         * @example
    			         *
    			         *     var encrypted = cipher.process('data');
    			         *     var encrypted = cipher.process(wordArray);
    			         */
    			        process: function (dataUpdate) {
    			            // Append
    			            this._append(dataUpdate);

    			            // Process available blocks
    			            return this._process();
    			        },

    			        /**
    			         * Finalizes the encryption or decryption process.
    			         * Note that the finalize operation is effectively a destructive, read-once operation.
    			         *
    			         * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
    			         *
    			         * @return {WordArray} The data after final processing.
    			         *
    			         * @example
    			         *
    			         *     var encrypted = cipher.finalize();
    			         *     var encrypted = cipher.finalize('data');
    			         *     var encrypted = cipher.finalize(wordArray);
    			         */
    			        finalize: function (dataUpdate) {
    			            // Final data update
    			            if (dataUpdate) {
    			                this._append(dataUpdate);
    			            }

    			            // Perform concrete-cipher logic
    			            var finalProcessedData = this._doFinalize();

    			            return finalProcessedData;
    			        },

    			        keySize: 128/32,

    			        ivSize: 128/32,

    			        _ENC_XFORM_MODE: 1,

    			        _DEC_XFORM_MODE: 2,

    			        /**
    			         * Creates shortcut functions to a cipher's object interface.
    			         *
    			         * @param {Cipher} cipher The cipher to create a helper for.
    			         *
    			         * @return {Object} An object with encrypt and decrypt shortcut functions.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
    			         */
    			        _createHelper: (function () {
    			            function selectCipherStrategy(key) {
    			                if (typeof key == 'string') {
    			                    return PasswordBasedCipher;
    			                } else {
    			                    return SerializableCipher;
    			                }
    			            }

    			            return function (cipher) {
    			                return {
    			                    encrypt: function (message, key, cfg) {
    			                        return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
    			                    },

    			                    decrypt: function (ciphertext, key, cfg) {
    			                        return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
    			                    }
    			                };
    			            };
    			        }())
    			    });

    			    /**
    			     * Abstract base stream cipher template.
    			     *
    			     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
    			     */
    			    C_lib.StreamCipher = Cipher.extend({
    			        _doFinalize: function () {
    			            // Process partial blocks
    			            var finalProcessedBlocks = this._process(!!'flush');

    			            return finalProcessedBlocks;
    			        },

    			        blockSize: 1
    			    });

    			    /**
    			     * Mode namespace.
    			     */
    			    var C_mode = C.mode = {};

    			    /**
    			     * Abstract base block cipher mode template.
    			     */
    			    var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
    			        /**
    			         * Creates this mode for encryption.
    			         *
    			         * @param {Cipher} cipher A block cipher instance.
    			         * @param {Array} iv The IV words.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
    			         */
    			        createEncryptor: function (cipher, iv) {
    			            return this.Encryptor.create(cipher, iv);
    			        },

    			        /**
    			         * Creates this mode for decryption.
    			         *
    			         * @param {Cipher} cipher A block cipher instance.
    			         * @param {Array} iv The IV words.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
    			         */
    			        createDecryptor: function (cipher, iv) {
    			            return this.Decryptor.create(cipher, iv);
    			        },

    			        /**
    			         * Initializes a newly created mode.
    			         *
    			         * @param {Cipher} cipher A block cipher instance.
    			         * @param {Array} iv The IV words.
    			         *
    			         * @example
    			         *
    			         *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
    			         */
    			        init: function (cipher, iv) {
    			            this._cipher = cipher;
    			            this._iv = iv;
    			        }
    			    });

    			    /**
    			     * Cipher Block Chaining mode.
    			     */
    			    var CBC = C_mode.CBC = (function () {
    			        /**
    			         * Abstract base CBC mode.
    			         */
    			        var CBC = BlockCipherMode.extend();

    			        /**
    			         * CBC encryptor.
    			         */
    			        CBC.Encryptor = CBC.extend({
    			            /**
    			             * Processes the data block at offset.
    			             *
    			             * @param {Array} words The data words to operate on.
    			             * @param {number} offset The offset where the block starts.
    			             *
    			             * @example
    			             *
    			             *     mode.processBlock(data.words, offset);
    			             */
    			            processBlock: function (words, offset) {
    			                // Shortcuts
    			                var cipher = this._cipher;
    			                var blockSize = cipher.blockSize;

    			                // XOR and encrypt
    			                xorBlock.call(this, words, offset, blockSize);
    			                cipher.encryptBlock(words, offset);

    			                // Remember this block to use with next block
    			                this._prevBlock = words.slice(offset, offset + blockSize);
    			            }
    			        });

    			        /**
    			         * CBC decryptor.
    			         */
    			        CBC.Decryptor = CBC.extend({
    			            /**
    			             * Processes the data block at offset.
    			             *
    			             * @param {Array} words The data words to operate on.
    			             * @param {number} offset The offset where the block starts.
    			             *
    			             * @example
    			             *
    			             *     mode.processBlock(data.words, offset);
    			             */
    			            processBlock: function (words, offset) {
    			                // Shortcuts
    			                var cipher = this._cipher;
    			                var blockSize = cipher.blockSize;

    			                // Remember this block to use with next block
    			                var thisBlock = words.slice(offset, offset + blockSize);

    			                // Decrypt and XOR
    			                cipher.decryptBlock(words, offset);
    			                xorBlock.call(this, words, offset, blockSize);

    			                // This block becomes the previous block
    			                this._prevBlock = thisBlock;
    			            }
    			        });

    			        function xorBlock(words, offset, blockSize) {
    			            var block;

    			            // Shortcut
    			            var iv = this._iv;

    			            // Choose mixing block
    			            if (iv) {
    			                block = iv;

    			                // Remove IV for subsequent blocks
    			                this._iv = undefined$1;
    			            } else {
    			                block = this._prevBlock;
    			            }

    			            // XOR blocks
    			            for (var i = 0; i < blockSize; i++) {
    			                words[offset + i] ^= block[i];
    			            }
    			        }

    			        return CBC;
    			    }());

    			    /**
    			     * Padding namespace.
    			     */
    			    var C_pad = C.pad = {};

    			    /**
    			     * PKCS #5/7 padding strategy.
    			     */
    			    var Pkcs7 = C_pad.Pkcs7 = {
    			        /**
    			         * Pads data using the algorithm defined in PKCS #5/7.
    			         *
    			         * @param {WordArray} data The data to pad.
    			         * @param {number} blockSize The multiple that the data should be padded to.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
    			         */
    			        pad: function (data, blockSize) {
    			            // Shortcut
    			            var blockSizeBytes = blockSize * 4;

    			            // Count padding bytes
    			            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

    			            // Create padding word
    			            var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

    			            // Create padding
    			            var paddingWords = [];
    			            for (var i = 0; i < nPaddingBytes; i += 4) {
    			                paddingWords.push(paddingWord);
    			            }
    			            var padding = WordArray.create(paddingWords, nPaddingBytes);

    			            // Add padding
    			            data.concat(padding);
    			        },

    			        /**
    			         * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
    			         *
    			         * @param {WordArray} data The data to unpad.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     CryptoJS.pad.Pkcs7.unpad(wordArray);
    			         */
    			        unpad: function (data) {
    			            // Get number of padding bytes from last byte
    			            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

    			            // Remove padding
    			            data.sigBytes -= nPaddingBytes;
    			        }
    			    };

    			    /**
    			     * Abstract base block cipher template.
    			     *
    			     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
    			     */
    			    C_lib.BlockCipher = Cipher.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {Mode} mode The block mode to use. Default: CBC
    			         * @property {Padding} padding The padding strategy to use. Default: Pkcs7
    			         */
    			        cfg: Cipher.cfg.extend({
    			            mode: CBC,
    			            padding: Pkcs7
    			        }),

    			        reset: function () {
    			            var modeCreator;

    			            // Reset cipher
    			            Cipher.reset.call(this);

    			            // Shortcuts
    			            var cfg = this.cfg;
    			            var iv = cfg.iv;
    			            var mode = cfg.mode;

    			            // Reset block mode
    			            if (this._xformMode == this._ENC_XFORM_MODE) {
    			                modeCreator = mode.createEncryptor;
    			            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
    			                modeCreator = mode.createDecryptor;
    			                // Keep at least one block in the buffer for unpadding
    			                this._minBufferSize = 1;
    			            }

    			            if (this._mode && this._mode.__creator == modeCreator) {
    			                this._mode.init(this, iv && iv.words);
    			            } else {
    			                this._mode = modeCreator.call(mode, this, iv && iv.words);
    			                this._mode.__creator = modeCreator;
    			            }
    			        },

    			        _doProcessBlock: function (words, offset) {
    			            this._mode.processBlock(words, offset);
    			        },

    			        _doFinalize: function () {
    			            var finalProcessedBlocks;

    			            // Shortcut
    			            var padding = this.cfg.padding;

    			            // Finalize
    			            if (this._xformMode == this._ENC_XFORM_MODE) {
    			                // Pad data
    			                padding.pad(this._data, this.blockSize);

    			                // Process final blocks
    			                finalProcessedBlocks = this._process(!!'flush');
    			            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
    			                // Process final blocks
    			                finalProcessedBlocks = this._process(!!'flush');

    			                // Unpad data
    			                padding.unpad(finalProcessedBlocks);
    			            }

    			            return finalProcessedBlocks;
    			        },

    			        blockSize: 128/32
    			    });

    			    /**
    			     * A collection of cipher parameters.
    			     *
    			     * @property {WordArray} ciphertext The raw ciphertext.
    			     * @property {WordArray} key The key to this ciphertext.
    			     * @property {WordArray} iv The IV used in the ciphering operation.
    			     * @property {WordArray} salt The salt used with a key derivation function.
    			     * @property {Cipher} algorithm The cipher algorithm.
    			     * @property {Mode} mode The block mode used in the ciphering operation.
    			     * @property {Padding} padding The padding scheme used in the ciphering operation.
    			     * @property {number} blockSize The block size of the cipher.
    			     * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
    			     */
    			    var CipherParams = C_lib.CipherParams = Base.extend({
    			        /**
    			         * Initializes a newly created cipher params object.
    			         *
    			         * @param {Object} cipherParams An object with any of the possible cipher parameters.
    			         *
    			         * @example
    			         *
    			         *     var cipherParams = CryptoJS.lib.CipherParams.create({
    			         *         ciphertext: ciphertextWordArray,
    			         *         key: keyWordArray,
    			         *         iv: ivWordArray,
    			         *         salt: saltWordArray,
    			         *         algorithm: CryptoJS.algo.AES,
    			         *         mode: CryptoJS.mode.CBC,
    			         *         padding: CryptoJS.pad.PKCS7,
    			         *         blockSize: 4,
    			         *         formatter: CryptoJS.format.OpenSSL
    			         *     });
    			         */
    			        init: function (cipherParams) {
    			            this.mixIn(cipherParams);
    			        },

    			        /**
    			         * Converts this cipher params object to a string.
    			         *
    			         * @param {Format} formatter (Optional) The formatting strategy to use.
    			         *
    			         * @return {string} The stringified cipher params.
    			         *
    			         * @throws Error If neither the formatter nor the default formatter is set.
    			         *
    			         * @example
    			         *
    			         *     var string = cipherParams + '';
    			         *     var string = cipherParams.toString();
    			         *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
    			         */
    			        toString: function (formatter) {
    			            return (formatter || this.formatter).stringify(this);
    			        }
    			    });

    			    /**
    			     * Format namespace.
    			     */
    			    var C_format = C.format = {};

    			    /**
    			     * OpenSSL formatting strategy.
    			     */
    			    var OpenSSLFormatter = C_format.OpenSSL = {
    			        /**
    			         * Converts a cipher params object to an OpenSSL-compatible string.
    			         *
    			         * @param {CipherParams} cipherParams The cipher params object.
    			         *
    			         * @return {string} The OpenSSL-compatible string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
    			         */
    			        stringify: function (cipherParams) {
    			            var wordArray;

    			            // Shortcuts
    			            var ciphertext = cipherParams.ciphertext;
    			            var salt = cipherParams.salt;

    			            // Format
    			            if (salt) {
    			                wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
    			            } else {
    			                wordArray = ciphertext;
    			            }

    			            return wordArray.toString(Base64);
    			        },

    			        /**
    			         * Converts an OpenSSL-compatible string to a cipher params object.
    			         *
    			         * @param {string} openSSLStr The OpenSSL-compatible string.
    			         *
    			         * @return {CipherParams} The cipher params object.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
    			         */
    			        parse: function (openSSLStr) {
    			            var salt;

    			            // Parse base64
    			            var ciphertext = Base64.parse(openSSLStr);

    			            // Shortcut
    			            var ciphertextWords = ciphertext.words;

    			            // Test for salt
    			            if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
    			                // Extract salt
    			                salt = WordArray.create(ciphertextWords.slice(2, 4));

    			                // Remove salt from ciphertext
    			                ciphertextWords.splice(0, 4);
    			                ciphertext.sigBytes -= 16;
    			            }

    			            return CipherParams.create({ ciphertext: ciphertext, salt: salt });
    			        }
    			    };

    			    /**
    			     * A cipher wrapper that returns ciphertext as a serializable cipher params object.
    			     */
    			    var SerializableCipher = C_lib.SerializableCipher = Base.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
    			         */
    			        cfg: Base.extend({
    			            format: OpenSSLFormatter
    			        }),

    			        /**
    			         * Encrypts a message.
    			         *
    			         * @param {Cipher} cipher The cipher algorithm to use.
    			         * @param {WordArray|string} message The message to encrypt.
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {CipherParams} A cipher params object.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
    			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
    			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
    			         */
    			        encrypt: function (cipher, message, key, cfg) {
    			            // Apply config defaults
    			            cfg = this.cfg.extend(cfg);

    			            // Encrypt
    			            var encryptor = cipher.createEncryptor(key, cfg);
    			            var ciphertext = encryptor.finalize(message);

    			            // Shortcut
    			            var cipherCfg = encryptor.cfg;

    			            // Create and return serializable cipher params
    			            return CipherParams.create({
    			                ciphertext: ciphertext,
    			                key: key,
    			                iv: cipherCfg.iv,
    			                algorithm: cipher,
    			                mode: cipherCfg.mode,
    			                padding: cipherCfg.padding,
    			                blockSize: cipher.blockSize,
    			                formatter: cfg.format
    			            });
    			        },

    			        /**
    			         * Decrypts serialized ciphertext.
    			         *
    			         * @param {Cipher} cipher The cipher algorithm to use.
    			         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
    			         * @param {WordArray} key The key.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {WordArray} The plaintext.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
    			         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
    			         */
    			        decrypt: function (cipher, ciphertext, key, cfg) {
    			            // Apply config defaults
    			            cfg = this.cfg.extend(cfg);

    			            // Convert string to CipherParams
    			            ciphertext = this._parse(ciphertext, cfg.format);

    			            // Decrypt
    			            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);

    			            return plaintext;
    			        },

    			        /**
    			         * Converts serialized ciphertext to CipherParams,
    			         * else assumed CipherParams already and returns ciphertext unchanged.
    			         *
    			         * @param {CipherParams|string} ciphertext The ciphertext.
    			         * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
    			         *
    			         * @return {CipherParams} The unserialized ciphertext.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
    			         */
    			        _parse: function (ciphertext, format) {
    			            if (typeof ciphertext == 'string') {
    			                return format.parse(ciphertext, this);
    			            } else {
    			                return ciphertext;
    			            }
    			        }
    			    });

    			    /**
    			     * Key derivation function namespace.
    			     */
    			    var C_kdf = C.kdf = {};

    			    /**
    			     * OpenSSL key derivation function.
    			     */
    			    var OpenSSLKdf = C_kdf.OpenSSL = {
    			        /**
    			         * Derives a key and IV from a password.
    			         *
    			         * @param {string} password The password to derive from.
    			         * @param {number} keySize The size in words of the key to generate.
    			         * @param {number} ivSize The size in words of the IV to generate.
    			         * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
    			         *
    			         * @return {CipherParams} A cipher params object with the key, IV, and salt.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
    			         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
    			         */
    			        execute: function (password, keySize, ivSize, salt) {
    			            // Generate random salt
    			            if (!salt) {
    			                salt = WordArray.random(64/8);
    			            }

    			            // Derive key and IV
    			            var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);

    			            // Separate key and IV
    			            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
    			            key.sigBytes = keySize * 4;

    			            // Return params
    			            return CipherParams.create({ key: key, iv: iv, salt: salt });
    			        }
    			    };

    			    /**
    			     * A serializable cipher wrapper that derives the key from a password,
    			     * and returns ciphertext as a serializable cipher params object.
    			     */
    			    var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
    			         */
    			        cfg: SerializableCipher.cfg.extend({
    			            kdf: OpenSSLKdf
    			        }),

    			        /**
    			         * Encrypts a message using a password.
    			         *
    			         * @param {Cipher} cipher The cipher algorithm to use.
    			         * @param {WordArray|string} message The message to encrypt.
    			         * @param {string} password The password.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {CipherParams} A cipher params object.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
    			         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
    			         */
    			        encrypt: function (cipher, message, password, cfg) {
    			            // Apply config defaults
    			            cfg = this.cfg.extend(cfg);

    			            // Derive key and other params
    			            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize);

    			            // Add IV to config
    			            cfg.iv = derivedParams.iv;

    			            // Encrypt
    			            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

    			            // Mix in derived params
    			            ciphertext.mixIn(derivedParams);

    			            return ciphertext;
    			        },

    			        /**
    			         * Decrypts serialized ciphertext using a password.
    			         *
    			         * @param {Cipher} cipher The cipher algorithm to use.
    			         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
    			         * @param {string} password The password.
    			         * @param {Object} cfg (Optional) The configuration options to use for this operation.
    			         *
    			         * @return {WordArray} The plaintext.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
    			         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
    			         */
    			        decrypt: function (cipher, ciphertext, password, cfg) {
    			            // Apply config defaults
    			            cfg = this.cfg.extend(cfg);

    			            // Convert string to CipherParams
    			            ciphertext = this._parse(ciphertext, cfg.format);

    			            // Derive key and other params
    			            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt);

    			            // Add IV to config
    			            cfg.iv = derivedParams.iv;

    			            // Decrypt
    			            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

    			            return plaintext;
    			        }
    			    });
    			}());


    		}));
    } (cipherCore));
    	return cipherCore.exports;
    }

    var modeCfb = {exports: {}};

    var hasRequiredModeCfb;

    function requireModeCfb () {
    	if (hasRequiredModeCfb) return modeCfb.exports;
    	hasRequiredModeCfb = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Cipher Feedback block mode.
    			 */
    			CryptoJS.mode.CFB = (function () {
    			    var CFB = CryptoJS.lib.BlockCipherMode.extend();

    			    CFB.Encryptor = CFB.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;

    			            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

    			            // Remember this block to use with next block
    			            this._prevBlock = words.slice(offset, offset + blockSize);
    			        }
    			    });

    			    CFB.Decryptor = CFB.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;

    			            // Remember this block to use with next block
    			            var thisBlock = words.slice(offset, offset + blockSize);

    			            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

    			            // This block becomes the previous block
    			            this._prevBlock = thisBlock;
    			        }
    			    });

    			    function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
    			        var keystream;

    			        // Shortcut
    			        var iv = this._iv;

    			        // Generate keystream
    			        if (iv) {
    			            keystream = iv.slice(0);

    			            // Remove IV for subsequent blocks
    			            this._iv = undefined;
    			        } else {
    			            keystream = this._prevBlock;
    			        }
    			        cipher.encryptBlock(keystream, 0);

    			        // Encrypt
    			        for (var i = 0; i < blockSize; i++) {
    			            words[offset + i] ^= keystream[i];
    			        }
    			    }

    			    return CFB;
    			}());


    			return CryptoJS.mode.CFB;

    		}));
    } (modeCfb));
    	return modeCfb.exports;
    }

    var modeCtr = {exports: {}};

    var hasRequiredModeCtr;

    function requireModeCtr () {
    	if (hasRequiredModeCtr) return modeCtr.exports;
    	hasRequiredModeCtr = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Counter block mode.
    			 */
    			CryptoJS.mode.CTR = (function () {
    			    var CTR = CryptoJS.lib.BlockCipherMode.extend();

    			    var Encryptor = CTR.Encryptor = CTR.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;
    			            var iv = this._iv;
    			            var counter = this._counter;

    			            // Generate keystream
    			            if (iv) {
    			                counter = this._counter = iv.slice(0);

    			                // Remove IV for subsequent blocks
    			                this._iv = undefined;
    			            }
    			            var keystream = counter.slice(0);
    			            cipher.encryptBlock(keystream, 0);

    			            // Increment counter
    			            counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0;

    			            // Encrypt
    			            for (var i = 0; i < blockSize; i++) {
    			                words[offset + i] ^= keystream[i];
    			            }
    			        }
    			    });

    			    CTR.Decryptor = Encryptor;

    			    return CTR;
    			}());


    			return CryptoJS.mode.CTR;

    		}));
    } (modeCtr));
    	return modeCtr.exports;
    }

    var modeCtrGladman = {exports: {}};

    var hasRequiredModeCtrGladman;

    function requireModeCtrGladman () {
    	if (hasRequiredModeCtrGladman) return modeCtrGladman.exports;
    	hasRequiredModeCtrGladman = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/** @preserve
    			 * Counter block mode compatible with  Dr Brian Gladman fileenc.c
    			 * derived from CryptoJS.mode.CTR
    			 * Jan Hruby jhruby.web@gmail.com
    			 */
    			CryptoJS.mode.CTRGladman = (function () {
    			    var CTRGladman = CryptoJS.lib.BlockCipherMode.extend();

    				function incWord(word)
    				{
    					if (((word >> 24) & 0xff) === 0xff) { //overflow
    					var b1 = (word >> 16)&0xff;
    					var b2 = (word >> 8)&0xff;
    					var b3 = word & 0xff;

    					if (b1 === 0xff) // overflow b1
    					{
    					b1 = 0;
    					if (b2 === 0xff)
    					{
    						b2 = 0;
    						if (b3 === 0xff)
    						{
    							b3 = 0;
    						}
    						else
    						{
    							++b3;
    						}
    					}
    					else
    					{
    						++b2;
    					}
    					}
    					else
    					{
    					++b1;
    					}

    					word = 0;
    					word += (b1 << 16);
    					word += (b2 << 8);
    					word += b3;
    					}
    					else
    					{
    					word += (0x01 << 24);
    					}
    					return word;
    				}

    				function incCounter(counter)
    				{
    					if ((counter[0] = incWord(counter[0])) === 0)
    					{
    						// encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
    						counter[1] = incWord(counter[1]);
    					}
    					return counter;
    				}

    			    var Encryptor = CTRGladman.Encryptor = CTRGladman.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;
    			            var iv = this._iv;
    			            var counter = this._counter;

    			            // Generate keystream
    			            if (iv) {
    			                counter = this._counter = iv.slice(0);

    			                // Remove IV for subsequent blocks
    			                this._iv = undefined;
    			            }

    						incCounter(counter);

    						var keystream = counter.slice(0);
    			            cipher.encryptBlock(keystream, 0);

    			            // Encrypt
    			            for (var i = 0; i < blockSize; i++) {
    			                words[offset + i] ^= keystream[i];
    			            }
    			        }
    			    });

    			    CTRGladman.Decryptor = Encryptor;

    			    return CTRGladman;
    			}());




    			return CryptoJS.mode.CTRGladman;

    		}));
    } (modeCtrGladman));
    	return modeCtrGladman.exports;
    }

    var modeOfb = {exports: {}};

    var hasRequiredModeOfb;

    function requireModeOfb () {
    	if (hasRequiredModeOfb) return modeOfb.exports;
    	hasRequiredModeOfb = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Output Feedback block mode.
    			 */
    			CryptoJS.mode.OFB = (function () {
    			    var OFB = CryptoJS.lib.BlockCipherMode.extend();

    			    var Encryptor = OFB.Encryptor = OFB.extend({
    			        processBlock: function (words, offset) {
    			            // Shortcuts
    			            var cipher = this._cipher;
    			            var blockSize = cipher.blockSize;
    			            var iv = this._iv;
    			            var keystream = this._keystream;

    			            // Generate keystream
    			            if (iv) {
    			                keystream = this._keystream = iv.slice(0);

    			                // Remove IV for subsequent blocks
    			                this._iv = undefined;
    			            }
    			            cipher.encryptBlock(keystream, 0);

    			            // Encrypt
    			            for (var i = 0; i < blockSize; i++) {
    			                words[offset + i] ^= keystream[i];
    			            }
    			        }
    			    });

    			    OFB.Decryptor = Encryptor;

    			    return OFB;
    			}());


    			return CryptoJS.mode.OFB;

    		}));
    } (modeOfb));
    	return modeOfb.exports;
    }

    var modeEcb = {exports: {}};

    var hasRequiredModeEcb;

    function requireModeEcb () {
    	if (hasRequiredModeEcb) return modeEcb.exports;
    	hasRequiredModeEcb = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Electronic Codebook block mode.
    			 */
    			CryptoJS.mode.ECB = (function () {
    			    var ECB = CryptoJS.lib.BlockCipherMode.extend();

    			    ECB.Encryptor = ECB.extend({
    			        processBlock: function (words, offset) {
    			            this._cipher.encryptBlock(words, offset);
    			        }
    			    });

    			    ECB.Decryptor = ECB.extend({
    			        processBlock: function (words, offset) {
    			            this._cipher.decryptBlock(words, offset);
    			        }
    			    });

    			    return ECB;
    			}());


    			return CryptoJS.mode.ECB;

    		}));
    } (modeEcb));
    	return modeEcb.exports;
    }

    var padAnsix923 = {exports: {}};

    var hasRequiredPadAnsix923;

    function requirePadAnsix923 () {
    	if (hasRequiredPadAnsix923) return padAnsix923.exports;
    	hasRequiredPadAnsix923 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * ANSI X.923 padding strategy.
    			 */
    			CryptoJS.pad.AnsiX923 = {
    			    pad: function (data, blockSize) {
    			        // Shortcuts
    			        var dataSigBytes = data.sigBytes;
    			        var blockSizeBytes = blockSize * 4;

    			        // Count padding bytes
    			        var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;

    			        // Compute last byte position
    			        var lastBytePos = dataSigBytes + nPaddingBytes - 1;

    			        // Pad
    			        data.clamp();
    			        data.words[lastBytePos >>> 2] |= nPaddingBytes << (24 - (lastBytePos % 4) * 8);
    			        data.sigBytes += nPaddingBytes;
    			    },

    			    unpad: function (data) {
    			        // Get number of padding bytes from last byte
    			        var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

    			        // Remove padding
    			        data.sigBytes -= nPaddingBytes;
    			    }
    			};


    			return CryptoJS.pad.Ansix923;

    		}));
    } (padAnsix923));
    	return padAnsix923.exports;
    }

    var padIso10126 = {exports: {}};

    var hasRequiredPadIso10126;

    function requirePadIso10126 () {
    	if (hasRequiredPadIso10126) return padIso10126.exports;
    	hasRequiredPadIso10126 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * ISO 10126 padding strategy.
    			 */
    			CryptoJS.pad.Iso10126 = {
    			    pad: function (data, blockSize) {
    			        // Shortcut
    			        var blockSizeBytes = blockSize * 4;

    			        // Count padding bytes
    			        var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

    			        // Pad
    			        data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).
    			             concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1));
    			    },

    			    unpad: function (data) {
    			        // Get number of padding bytes from last byte
    			        var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

    			        // Remove padding
    			        data.sigBytes -= nPaddingBytes;
    			    }
    			};


    			return CryptoJS.pad.Iso10126;

    		}));
    } (padIso10126));
    	return padIso10126.exports;
    }

    var padIso97971 = {exports: {}};

    var hasRequiredPadIso97971;

    function requirePadIso97971 () {
    	if (hasRequiredPadIso97971) return padIso97971.exports;
    	hasRequiredPadIso97971 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * ISO/IEC 9797-1 Padding Method 2.
    			 */
    			CryptoJS.pad.Iso97971 = {
    			    pad: function (data, blockSize) {
    			        // Add 0x80 byte
    			        data.concat(CryptoJS.lib.WordArray.create([0x80000000], 1));

    			        // Zero pad the rest
    			        CryptoJS.pad.ZeroPadding.pad(data, blockSize);
    			    },

    			    unpad: function (data) {
    			        // Remove zero padding
    			        CryptoJS.pad.ZeroPadding.unpad(data);

    			        // Remove one more byte -- the 0x80 byte
    			        data.sigBytes--;
    			    }
    			};


    			return CryptoJS.pad.Iso97971;

    		}));
    } (padIso97971));
    	return padIso97971.exports;
    }

    var padZeropadding = {exports: {}};

    var hasRequiredPadZeropadding;

    function requirePadZeropadding () {
    	if (hasRequiredPadZeropadding) return padZeropadding.exports;
    	hasRequiredPadZeropadding = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * Zero padding strategy.
    			 */
    			CryptoJS.pad.ZeroPadding = {
    			    pad: function (data, blockSize) {
    			        // Shortcut
    			        var blockSizeBytes = blockSize * 4;

    			        // Pad
    			        data.clamp();
    			        data.sigBytes += blockSizeBytes - ((data.sigBytes % blockSizeBytes) || blockSizeBytes);
    			    },

    			    unpad: function (data) {
    			        // Shortcut
    			        var dataWords = data.words;

    			        // Unpad
    			        var i = data.sigBytes - 1;
    			        for (var i = data.sigBytes - 1; i >= 0; i--) {
    			            if (((dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)) {
    			                data.sigBytes = i + 1;
    			                break;
    			            }
    			        }
    			    }
    			};


    			return CryptoJS.pad.ZeroPadding;

    		}));
    } (padZeropadding));
    	return padZeropadding.exports;
    }

    var padNopadding = {exports: {}};

    var hasRequiredPadNopadding;

    function requirePadNopadding () {
    	if (hasRequiredPadNopadding) return padNopadding.exports;
    	hasRequiredPadNopadding = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			/**
    			 * A noop padding strategy.
    			 */
    			CryptoJS.pad.NoPadding = {
    			    pad: function () {
    			    },

    			    unpad: function () {
    			    }
    			};


    			return CryptoJS.pad.NoPadding;

    		}));
    } (padNopadding));
    	return padNopadding.exports;
    }

    var formatHex = {exports: {}};

    var hasRequiredFormatHex;

    function requireFormatHex () {
    	if (hasRequiredFormatHex) return formatHex.exports;
    	hasRequiredFormatHex = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function (undefined$1) {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var CipherParams = C_lib.CipherParams;
    			    var C_enc = C.enc;
    			    var Hex = C_enc.Hex;
    			    var C_format = C.format;

    			    C_format.Hex = {
    			        /**
    			         * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
    			         *
    			         * @param {CipherParams} cipherParams The cipher params object.
    			         *
    			         * @return {string} The hexadecimally encoded string.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
    			         */
    			        stringify: function (cipherParams) {
    			            return cipherParams.ciphertext.toString(Hex);
    			        },

    			        /**
    			         * Converts a hexadecimally encoded ciphertext string to a cipher params object.
    			         *
    			         * @param {string} input The hexadecimally encoded string.
    			         *
    			         * @return {CipherParams} The cipher params object.
    			         *
    			         * @static
    			         *
    			         * @example
    			         *
    			         *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
    			         */
    			        parse: function (input) {
    			            var ciphertext = Hex.parse(input);
    			            return CipherParams.create({ ciphertext: ciphertext });
    			        }
    			    };
    			}());


    			return CryptoJS.format.Hex;

    		}));
    } (formatHex));
    	return formatHex.exports;
    }

    var aes = {exports: {}};

    var hasRequiredAes;

    function requireAes () {
    	if (hasRequiredAes) return aes.exports;
    	hasRequiredAes = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var BlockCipher = C_lib.BlockCipher;
    			    var C_algo = C.algo;

    			    // Lookup tables
    			    var SBOX = [];
    			    var INV_SBOX = [];
    			    var SUB_MIX_0 = [];
    			    var SUB_MIX_1 = [];
    			    var SUB_MIX_2 = [];
    			    var SUB_MIX_3 = [];
    			    var INV_SUB_MIX_0 = [];
    			    var INV_SUB_MIX_1 = [];
    			    var INV_SUB_MIX_2 = [];
    			    var INV_SUB_MIX_3 = [];

    			    // Compute lookup tables
    			    (function () {
    			        // Compute double table
    			        var d = [];
    			        for (var i = 0; i < 256; i++) {
    			            if (i < 128) {
    			                d[i] = i << 1;
    			            } else {
    			                d[i] = (i << 1) ^ 0x11b;
    			            }
    			        }

    			        // Walk GF(2^8)
    			        var x = 0;
    			        var xi = 0;
    			        for (var i = 0; i < 256; i++) {
    			            // Compute sbox
    			            var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
    			            sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
    			            SBOX[x] = sx;
    			            INV_SBOX[sx] = x;

    			            // Compute multiplication
    			            var x2 = d[x];
    			            var x4 = d[x2];
    			            var x8 = d[x4];

    			            // Compute sub bytes, mix columns tables
    			            var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
    			            SUB_MIX_0[x] = (t << 24) | (t >>> 8);
    			            SUB_MIX_1[x] = (t << 16) | (t >>> 16);
    			            SUB_MIX_2[x] = (t << 8)  | (t >>> 24);
    			            SUB_MIX_3[x] = t;

    			            // Compute inv sub bytes, inv mix columns tables
    			            var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
    			            INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
    			            INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
    			            INV_SUB_MIX_2[sx] = (t << 8)  | (t >>> 24);
    			            INV_SUB_MIX_3[sx] = t;

    			            // Compute next counter
    			            if (!x) {
    			                x = xi = 1;
    			            } else {
    			                x = x2 ^ d[d[d[x8 ^ x2]]];
    			                xi ^= d[d[xi]];
    			            }
    			        }
    			    }());

    			    // Precomputed Rcon lookup
    			    var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

    			    /**
    			     * AES block cipher algorithm.
    			     */
    			    var AES = C_algo.AES = BlockCipher.extend({
    			        _doReset: function () {
    			            var t;

    			            // Skip reset of nRounds has been set before and key did not change
    			            if (this._nRounds && this._keyPriorReset === this._key) {
    			                return;
    			            }

    			            // Shortcuts
    			            var key = this._keyPriorReset = this._key;
    			            var keyWords = key.words;
    			            var keySize = key.sigBytes / 4;

    			            // Compute number of rounds
    			            var nRounds = this._nRounds = keySize + 6;

    			            // Compute number of key schedule rows
    			            var ksRows = (nRounds + 1) * 4;

    			            // Compute key schedule
    			            var keySchedule = this._keySchedule = [];
    			            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
    			                if (ksRow < keySize) {
    			                    keySchedule[ksRow] = keyWords[ksRow];
    			                } else {
    			                    t = keySchedule[ksRow - 1];

    			                    if (!(ksRow % keySize)) {
    			                        // Rot word
    			                        t = (t << 8) | (t >>> 24);

    			                        // Sub word
    			                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

    			                        // Mix Rcon
    			                        t ^= RCON[(ksRow / keySize) | 0] << 24;
    			                    } else if (keySize > 6 && ksRow % keySize == 4) {
    			                        // Sub word
    			                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
    			                    }

    			                    keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
    			                }
    			            }

    			            // Compute inv key schedule
    			            var invKeySchedule = this._invKeySchedule = [];
    			            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
    			                var ksRow = ksRows - invKsRow;

    			                if (invKsRow % 4) {
    			                    var t = keySchedule[ksRow];
    			                } else {
    			                    var t = keySchedule[ksRow - 4];
    			                }

    			                if (invKsRow < 4 || ksRow <= 4) {
    			                    invKeySchedule[invKsRow] = t;
    			                } else {
    			                    invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
    			                                               INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
    			                }
    			            }
    			        },

    			        encryptBlock: function (M, offset) {
    			            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
    			        },

    			        decryptBlock: function (M, offset) {
    			            // Swap 2nd and 4th rows
    			            var t = M[offset + 1];
    			            M[offset + 1] = M[offset + 3];
    			            M[offset + 3] = t;

    			            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);

    			            // Inv swap 2nd and 4th rows
    			            var t = M[offset + 1];
    			            M[offset + 1] = M[offset + 3];
    			            M[offset + 3] = t;
    			        },

    			        _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
    			            // Shortcut
    			            var nRounds = this._nRounds;

    			            // Get input, add round key
    			            var s0 = M[offset]     ^ keySchedule[0];
    			            var s1 = M[offset + 1] ^ keySchedule[1];
    			            var s2 = M[offset + 2] ^ keySchedule[2];
    			            var s3 = M[offset + 3] ^ keySchedule[3];

    			            // Key schedule row counter
    			            var ksRow = 4;

    			            // Rounds
    			            for (var round = 1; round < nRounds; round++) {
    			                // Shift rows, sub bytes, mix columns, add round key
    			                var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
    			                var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
    			                var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
    			                var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];

    			                // Update state
    			                s0 = t0;
    			                s1 = t1;
    			                s2 = t2;
    			                s3 = t3;
    			            }

    			            // Shift rows, sub bytes, add round key
    			            var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
    			            var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
    			            var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
    			            var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];

    			            // Set output
    			            M[offset]     = t0;
    			            M[offset + 1] = t1;
    			            M[offset + 2] = t2;
    			            M[offset + 3] = t3;
    			        },

    			        keySize: 256/32
    			    });

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
    			     */
    			    C.AES = BlockCipher._createHelper(AES);
    			}());


    			return CryptoJS.AES;

    		}));
    } (aes));
    	return aes.exports;
    }

    var tripledes = {exports: {}};

    var hasRequiredTripledes;

    function requireTripledes () {
    	if (hasRequiredTripledes) return tripledes.exports;
    	hasRequiredTripledes = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var WordArray = C_lib.WordArray;
    			    var BlockCipher = C_lib.BlockCipher;
    			    var C_algo = C.algo;

    			    // Permuted Choice 1 constants
    			    var PC1 = [
    			        57, 49, 41, 33, 25, 17, 9,  1,
    			        58, 50, 42, 34, 26, 18, 10, 2,
    			        59, 51, 43, 35, 27, 19, 11, 3,
    			        60, 52, 44, 36, 63, 55, 47, 39,
    			        31, 23, 15, 7,  62, 54, 46, 38,
    			        30, 22, 14, 6,  61, 53, 45, 37,
    			        29, 21, 13, 5,  28, 20, 12, 4
    			    ];

    			    // Permuted Choice 2 constants
    			    var PC2 = [
    			        14, 17, 11, 24, 1,  5,
    			        3,  28, 15, 6,  21, 10,
    			        23, 19, 12, 4,  26, 8,
    			        16, 7,  27, 20, 13, 2,
    			        41, 52, 31, 37, 47, 55,
    			        30, 40, 51, 45, 33, 48,
    			        44, 49, 39, 56, 34, 53,
    			        46, 42, 50, 36, 29, 32
    			    ];

    			    // Cumulative bit shift constants
    			    var BIT_SHIFTS = [1,  2,  4,  6,  8,  10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];

    			    // SBOXes and round permutation constants
    			    var SBOX_P = [
    			        {
    			            0x0: 0x808200,
    			            0x10000000: 0x8000,
    			            0x20000000: 0x808002,
    			            0x30000000: 0x2,
    			            0x40000000: 0x200,
    			            0x50000000: 0x808202,
    			            0x60000000: 0x800202,
    			            0x70000000: 0x800000,
    			            0x80000000: 0x202,
    			            0x90000000: 0x800200,
    			            0xa0000000: 0x8200,
    			            0xb0000000: 0x808000,
    			            0xc0000000: 0x8002,
    			            0xd0000000: 0x800002,
    			            0xe0000000: 0x0,
    			            0xf0000000: 0x8202,
    			            0x8000000: 0x0,
    			            0x18000000: 0x808202,
    			            0x28000000: 0x8202,
    			            0x38000000: 0x8000,
    			            0x48000000: 0x808200,
    			            0x58000000: 0x200,
    			            0x68000000: 0x808002,
    			            0x78000000: 0x2,
    			            0x88000000: 0x800200,
    			            0x98000000: 0x8200,
    			            0xa8000000: 0x808000,
    			            0xb8000000: 0x800202,
    			            0xc8000000: 0x800002,
    			            0xd8000000: 0x8002,
    			            0xe8000000: 0x202,
    			            0xf8000000: 0x800000,
    			            0x1: 0x8000,
    			            0x10000001: 0x2,
    			            0x20000001: 0x808200,
    			            0x30000001: 0x800000,
    			            0x40000001: 0x808002,
    			            0x50000001: 0x8200,
    			            0x60000001: 0x200,
    			            0x70000001: 0x800202,
    			            0x80000001: 0x808202,
    			            0x90000001: 0x808000,
    			            0xa0000001: 0x800002,
    			            0xb0000001: 0x8202,
    			            0xc0000001: 0x202,
    			            0xd0000001: 0x800200,
    			            0xe0000001: 0x8002,
    			            0xf0000001: 0x0,
    			            0x8000001: 0x808202,
    			            0x18000001: 0x808000,
    			            0x28000001: 0x800000,
    			            0x38000001: 0x200,
    			            0x48000001: 0x8000,
    			            0x58000001: 0x800002,
    			            0x68000001: 0x2,
    			            0x78000001: 0x8202,
    			            0x88000001: 0x8002,
    			            0x98000001: 0x800202,
    			            0xa8000001: 0x202,
    			            0xb8000001: 0x808200,
    			            0xc8000001: 0x800200,
    			            0xd8000001: 0x0,
    			            0xe8000001: 0x8200,
    			            0xf8000001: 0x808002
    			        },
    			        {
    			            0x0: 0x40084010,
    			            0x1000000: 0x4000,
    			            0x2000000: 0x80000,
    			            0x3000000: 0x40080010,
    			            0x4000000: 0x40000010,
    			            0x5000000: 0x40084000,
    			            0x6000000: 0x40004000,
    			            0x7000000: 0x10,
    			            0x8000000: 0x84000,
    			            0x9000000: 0x40004010,
    			            0xa000000: 0x40000000,
    			            0xb000000: 0x84010,
    			            0xc000000: 0x80010,
    			            0xd000000: 0x0,
    			            0xe000000: 0x4010,
    			            0xf000000: 0x40080000,
    			            0x800000: 0x40004000,
    			            0x1800000: 0x84010,
    			            0x2800000: 0x10,
    			            0x3800000: 0x40004010,
    			            0x4800000: 0x40084010,
    			            0x5800000: 0x40000000,
    			            0x6800000: 0x80000,
    			            0x7800000: 0x40080010,
    			            0x8800000: 0x80010,
    			            0x9800000: 0x0,
    			            0xa800000: 0x4000,
    			            0xb800000: 0x40080000,
    			            0xc800000: 0x40000010,
    			            0xd800000: 0x84000,
    			            0xe800000: 0x40084000,
    			            0xf800000: 0x4010,
    			            0x10000000: 0x0,
    			            0x11000000: 0x40080010,
    			            0x12000000: 0x40004010,
    			            0x13000000: 0x40084000,
    			            0x14000000: 0x40080000,
    			            0x15000000: 0x10,
    			            0x16000000: 0x84010,
    			            0x17000000: 0x4000,
    			            0x18000000: 0x4010,
    			            0x19000000: 0x80000,
    			            0x1a000000: 0x80010,
    			            0x1b000000: 0x40000010,
    			            0x1c000000: 0x84000,
    			            0x1d000000: 0x40004000,
    			            0x1e000000: 0x40000000,
    			            0x1f000000: 0x40084010,
    			            0x10800000: 0x84010,
    			            0x11800000: 0x80000,
    			            0x12800000: 0x40080000,
    			            0x13800000: 0x4000,
    			            0x14800000: 0x40004000,
    			            0x15800000: 0x40084010,
    			            0x16800000: 0x10,
    			            0x17800000: 0x40000000,
    			            0x18800000: 0x40084000,
    			            0x19800000: 0x40000010,
    			            0x1a800000: 0x40004010,
    			            0x1b800000: 0x80010,
    			            0x1c800000: 0x0,
    			            0x1d800000: 0x4010,
    			            0x1e800000: 0x40080010,
    			            0x1f800000: 0x84000
    			        },
    			        {
    			            0x0: 0x104,
    			            0x100000: 0x0,
    			            0x200000: 0x4000100,
    			            0x300000: 0x10104,
    			            0x400000: 0x10004,
    			            0x500000: 0x4000004,
    			            0x600000: 0x4010104,
    			            0x700000: 0x4010000,
    			            0x800000: 0x4000000,
    			            0x900000: 0x4010100,
    			            0xa00000: 0x10100,
    			            0xb00000: 0x4010004,
    			            0xc00000: 0x4000104,
    			            0xd00000: 0x10000,
    			            0xe00000: 0x4,
    			            0xf00000: 0x100,
    			            0x80000: 0x4010100,
    			            0x180000: 0x4010004,
    			            0x280000: 0x0,
    			            0x380000: 0x4000100,
    			            0x480000: 0x4000004,
    			            0x580000: 0x10000,
    			            0x680000: 0x10004,
    			            0x780000: 0x104,
    			            0x880000: 0x4,
    			            0x980000: 0x100,
    			            0xa80000: 0x4010000,
    			            0xb80000: 0x10104,
    			            0xc80000: 0x10100,
    			            0xd80000: 0x4000104,
    			            0xe80000: 0x4010104,
    			            0xf80000: 0x4000000,
    			            0x1000000: 0x4010100,
    			            0x1100000: 0x10004,
    			            0x1200000: 0x10000,
    			            0x1300000: 0x4000100,
    			            0x1400000: 0x100,
    			            0x1500000: 0x4010104,
    			            0x1600000: 0x4000004,
    			            0x1700000: 0x0,
    			            0x1800000: 0x4000104,
    			            0x1900000: 0x4000000,
    			            0x1a00000: 0x4,
    			            0x1b00000: 0x10100,
    			            0x1c00000: 0x4010000,
    			            0x1d00000: 0x104,
    			            0x1e00000: 0x10104,
    			            0x1f00000: 0x4010004,
    			            0x1080000: 0x4000000,
    			            0x1180000: 0x104,
    			            0x1280000: 0x4010100,
    			            0x1380000: 0x0,
    			            0x1480000: 0x10004,
    			            0x1580000: 0x4000100,
    			            0x1680000: 0x100,
    			            0x1780000: 0x4010004,
    			            0x1880000: 0x10000,
    			            0x1980000: 0x4010104,
    			            0x1a80000: 0x10104,
    			            0x1b80000: 0x4000004,
    			            0x1c80000: 0x4000104,
    			            0x1d80000: 0x4010000,
    			            0x1e80000: 0x4,
    			            0x1f80000: 0x10100
    			        },
    			        {
    			            0x0: 0x80401000,
    			            0x10000: 0x80001040,
    			            0x20000: 0x401040,
    			            0x30000: 0x80400000,
    			            0x40000: 0x0,
    			            0x50000: 0x401000,
    			            0x60000: 0x80000040,
    			            0x70000: 0x400040,
    			            0x80000: 0x80000000,
    			            0x90000: 0x400000,
    			            0xa0000: 0x40,
    			            0xb0000: 0x80001000,
    			            0xc0000: 0x80400040,
    			            0xd0000: 0x1040,
    			            0xe0000: 0x1000,
    			            0xf0000: 0x80401040,
    			            0x8000: 0x80001040,
    			            0x18000: 0x40,
    			            0x28000: 0x80400040,
    			            0x38000: 0x80001000,
    			            0x48000: 0x401000,
    			            0x58000: 0x80401040,
    			            0x68000: 0x0,
    			            0x78000: 0x80400000,
    			            0x88000: 0x1000,
    			            0x98000: 0x80401000,
    			            0xa8000: 0x400000,
    			            0xb8000: 0x1040,
    			            0xc8000: 0x80000000,
    			            0xd8000: 0x400040,
    			            0xe8000: 0x401040,
    			            0xf8000: 0x80000040,
    			            0x100000: 0x400040,
    			            0x110000: 0x401000,
    			            0x120000: 0x80000040,
    			            0x130000: 0x0,
    			            0x140000: 0x1040,
    			            0x150000: 0x80400040,
    			            0x160000: 0x80401000,
    			            0x170000: 0x80001040,
    			            0x180000: 0x80401040,
    			            0x190000: 0x80000000,
    			            0x1a0000: 0x80400000,
    			            0x1b0000: 0x401040,
    			            0x1c0000: 0x80001000,
    			            0x1d0000: 0x400000,
    			            0x1e0000: 0x40,
    			            0x1f0000: 0x1000,
    			            0x108000: 0x80400000,
    			            0x118000: 0x80401040,
    			            0x128000: 0x0,
    			            0x138000: 0x401000,
    			            0x148000: 0x400040,
    			            0x158000: 0x80000000,
    			            0x168000: 0x80001040,
    			            0x178000: 0x40,
    			            0x188000: 0x80000040,
    			            0x198000: 0x1000,
    			            0x1a8000: 0x80001000,
    			            0x1b8000: 0x80400040,
    			            0x1c8000: 0x1040,
    			            0x1d8000: 0x80401000,
    			            0x1e8000: 0x400000,
    			            0x1f8000: 0x401040
    			        },
    			        {
    			            0x0: 0x80,
    			            0x1000: 0x1040000,
    			            0x2000: 0x40000,
    			            0x3000: 0x20000000,
    			            0x4000: 0x20040080,
    			            0x5000: 0x1000080,
    			            0x6000: 0x21000080,
    			            0x7000: 0x40080,
    			            0x8000: 0x1000000,
    			            0x9000: 0x20040000,
    			            0xa000: 0x20000080,
    			            0xb000: 0x21040080,
    			            0xc000: 0x21040000,
    			            0xd000: 0x0,
    			            0xe000: 0x1040080,
    			            0xf000: 0x21000000,
    			            0x800: 0x1040080,
    			            0x1800: 0x21000080,
    			            0x2800: 0x80,
    			            0x3800: 0x1040000,
    			            0x4800: 0x40000,
    			            0x5800: 0x20040080,
    			            0x6800: 0x21040000,
    			            0x7800: 0x20000000,
    			            0x8800: 0x20040000,
    			            0x9800: 0x0,
    			            0xa800: 0x21040080,
    			            0xb800: 0x1000080,
    			            0xc800: 0x20000080,
    			            0xd800: 0x21000000,
    			            0xe800: 0x1000000,
    			            0xf800: 0x40080,
    			            0x10000: 0x40000,
    			            0x11000: 0x80,
    			            0x12000: 0x20000000,
    			            0x13000: 0x21000080,
    			            0x14000: 0x1000080,
    			            0x15000: 0x21040000,
    			            0x16000: 0x20040080,
    			            0x17000: 0x1000000,
    			            0x18000: 0x21040080,
    			            0x19000: 0x21000000,
    			            0x1a000: 0x1040000,
    			            0x1b000: 0x20040000,
    			            0x1c000: 0x40080,
    			            0x1d000: 0x20000080,
    			            0x1e000: 0x0,
    			            0x1f000: 0x1040080,
    			            0x10800: 0x21000080,
    			            0x11800: 0x1000000,
    			            0x12800: 0x1040000,
    			            0x13800: 0x20040080,
    			            0x14800: 0x20000000,
    			            0x15800: 0x1040080,
    			            0x16800: 0x80,
    			            0x17800: 0x21040000,
    			            0x18800: 0x40080,
    			            0x19800: 0x21040080,
    			            0x1a800: 0x0,
    			            0x1b800: 0x21000000,
    			            0x1c800: 0x1000080,
    			            0x1d800: 0x40000,
    			            0x1e800: 0x20040000,
    			            0x1f800: 0x20000080
    			        },
    			        {
    			            0x0: 0x10000008,
    			            0x100: 0x2000,
    			            0x200: 0x10200000,
    			            0x300: 0x10202008,
    			            0x400: 0x10002000,
    			            0x500: 0x200000,
    			            0x600: 0x200008,
    			            0x700: 0x10000000,
    			            0x800: 0x0,
    			            0x900: 0x10002008,
    			            0xa00: 0x202000,
    			            0xb00: 0x8,
    			            0xc00: 0x10200008,
    			            0xd00: 0x202008,
    			            0xe00: 0x2008,
    			            0xf00: 0x10202000,
    			            0x80: 0x10200000,
    			            0x180: 0x10202008,
    			            0x280: 0x8,
    			            0x380: 0x200000,
    			            0x480: 0x202008,
    			            0x580: 0x10000008,
    			            0x680: 0x10002000,
    			            0x780: 0x2008,
    			            0x880: 0x200008,
    			            0x980: 0x2000,
    			            0xa80: 0x10002008,
    			            0xb80: 0x10200008,
    			            0xc80: 0x0,
    			            0xd80: 0x10202000,
    			            0xe80: 0x202000,
    			            0xf80: 0x10000000,
    			            0x1000: 0x10002000,
    			            0x1100: 0x10200008,
    			            0x1200: 0x10202008,
    			            0x1300: 0x2008,
    			            0x1400: 0x200000,
    			            0x1500: 0x10000000,
    			            0x1600: 0x10000008,
    			            0x1700: 0x202000,
    			            0x1800: 0x202008,
    			            0x1900: 0x0,
    			            0x1a00: 0x8,
    			            0x1b00: 0x10200000,
    			            0x1c00: 0x2000,
    			            0x1d00: 0x10002008,
    			            0x1e00: 0x10202000,
    			            0x1f00: 0x200008,
    			            0x1080: 0x8,
    			            0x1180: 0x202000,
    			            0x1280: 0x200000,
    			            0x1380: 0x10000008,
    			            0x1480: 0x10002000,
    			            0x1580: 0x2008,
    			            0x1680: 0x10202008,
    			            0x1780: 0x10200000,
    			            0x1880: 0x10202000,
    			            0x1980: 0x10200008,
    			            0x1a80: 0x2000,
    			            0x1b80: 0x202008,
    			            0x1c80: 0x200008,
    			            0x1d80: 0x0,
    			            0x1e80: 0x10000000,
    			            0x1f80: 0x10002008
    			        },
    			        {
    			            0x0: 0x100000,
    			            0x10: 0x2000401,
    			            0x20: 0x400,
    			            0x30: 0x100401,
    			            0x40: 0x2100401,
    			            0x50: 0x0,
    			            0x60: 0x1,
    			            0x70: 0x2100001,
    			            0x80: 0x2000400,
    			            0x90: 0x100001,
    			            0xa0: 0x2000001,
    			            0xb0: 0x2100400,
    			            0xc0: 0x2100000,
    			            0xd0: 0x401,
    			            0xe0: 0x100400,
    			            0xf0: 0x2000000,
    			            0x8: 0x2100001,
    			            0x18: 0x0,
    			            0x28: 0x2000401,
    			            0x38: 0x2100400,
    			            0x48: 0x100000,
    			            0x58: 0x2000001,
    			            0x68: 0x2000000,
    			            0x78: 0x401,
    			            0x88: 0x100401,
    			            0x98: 0x2000400,
    			            0xa8: 0x2100000,
    			            0xb8: 0x100001,
    			            0xc8: 0x400,
    			            0xd8: 0x2100401,
    			            0xe8: 0x1,
    			            0xf8: 0x100400,
    			            0x100: 0x2000000,
    			            0x110: 0x100000,
    			            0x120: 0x2000401,
    			            0x130: 0x2100001,
    			            0x140: 0x100001,
    			            0x150: 0x2000400,
    			            0x160: 0x2100400,
    			            0x170: 0x100401,
    			            0x180: 0x401,
    			            0x190: 0x2100401,
    			            0x1a0: 0x100400,
    			            0x1b0: 0x1,
    			            0x1c0: 0x0,
    			            0x1d0: 0x2100000,
    			            0x1e0: 0x2000001,
    			            0x1f0: 0x400,
    			            0x108: 0x100400,
    			            0x118: 0x2000401,
    			            0x128: 0x2100001,
    			            0x138: 0x1,
    			            0x148: 0x2000000,
    			            0x158: 0x100000,
    			            0x168: 0x401,
    			            0x178: 0x2100400,
    			            0x188: 0x2000001,
    			            0x198: 0x2100000,
    			            0x1a8: 0x0,
    			            0x1b8: 0x2100401,
    			            0x1c8: 0x100401,
    			            0x1d8: 0x400,
    			            0x1e8: 0x2000400,
    			            0x1f8: 0x100001
    			        },
    			        {
    			            0x0: 0x8000820,
    			            0x1: 0x20000,
    			            0x2: 0x8000000,
    			            0x3: 0x20,
    			            0x4: 0x20020,
    			            0x5: 0x8020820,
    			            0x6: 0x8020800,
    			            0x7: 0x800,
    			            0x8: 0x8020000,
    			            0x9: 0x8000800,
    			            0xa: 0x20800,
    			            0xb: 0x8020020,
    			            0xc: 0x820,
    			            0xd: 0x0,
    			            0xe: 0x8000020,
    			            0xf: 0x20820,
    			            0x80000000: 0x800,
    			            0x80000001: 0x8020820,
    			            0x80000002: 0x8000820,
    			            0x80000003: 0x8000000,
    			            0x80000004: 0x8020000,
    			            0x80000005: 0x20800,
    			            0x80000006: 0x20820,
    			            0x80000007: 0x20,
    			            0x80000008: 0x8000020,
    			            0x80000009: 0x820,
    			            0x8000000a: 0x20020,
    			            0x8000000b: 0x8020800,
    			            0x8000000c: 0x0,
    			            0x8000000d: 0x8020020,
    			            0x8000000e: 0x8000800,
    			            0x8000000f: 0x20000,
    			            0x10: 0x20820,
    			            0x11: 0x8020800,
    			            0x12: 0x20,
    			            0x13: 0x800,
    			            0x14: 0x8000800,
    			            0x15: 0x8000020,
    			            0x16: 0x8020020,
    			            0x17: 0x20000,
    			            0x18: 0x0,
    			            0x19: 0x20020,
    			            0x1a: 0x8020000,
    			            0x1b: 0x8000820,
    			            0x1c: 0x8020820,
    			            0x1d: 0x20800,
    			            0x1e: 0x820,
    			            0x1f: 0x8000000,
    			            0x80000010: 0x20000,
    			            0x80000011: 0x800,
    			            0x80000012: 0x8020020,
    			            0x80000013: 0x20820,
    			            0x80000014: 0x20,
    			            0x80000015: 0x8020000,
    			            0x80000016: 0x8000000,
    			            0x80000017: 0x8000820,
    			            0x80000018: 0x8020820,
    			            0x80000019: 0x8000020,
    			            0x8000001a: 0x8000800,
    			            0x8000001b: 0x0,
    			            0x8000001c: 0x20800,
    			            0x8000001d: 0x820,
    			            0x8000001e: 0x20020,
    			            0x8000001f: 0x8020800
    			        }
    			    ];

    			    // Masks that select the SBOX input
    			    var SBOX_MASK = [
    			        0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000,
    			        0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f
    			    ];

    			    /**
    			     * DES block cipher algorithm.
    			     */
    			    var DES = C_algo.DES = BlockCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var key = this._key;
    			            var keyWords = key.words;

    			            // Select 56 bits according to PC1
    			            var keyBits = [];
    			            for (var i = 0; i < 56; i++) {
    			                var keyBitPos = PC1[i] - 1;
    			                keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - keyBitPos % 32)) & 1;
    			            }

    			            // Assemble 16 subkeys
    			            var subKeys = this._subKeys = [];
    			            for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
    			                // Create subkey
    			                var subKey = subKeys[nSubKey] = [];

    			                // Shortcut
    			                var bitShift = BIT_SHIFTS[nSubKey];

    			                // Select 48 bits according to PC2
    			                for (var i = 0; i < 24; i++) {
    			                    // Select from the left 28 key bits
    			                    subKey[(i / 6) | 0] |= keyBits[((PC2[i] - 1) + bitShift) % 28] << (31 - i % 6);

    			                    // Select from the right 28 key bits
    			                    subKey[4 + ((i / 6) | 0)] |= keyBits[28 + (((PC2[i + 24] - 1) + bitShift) % 28)] << (31 - i % 6);
    			                }

    			                // Since each subkey is applied to an expanded 32-bit input,
    			                // the subkey can be broken into 8 values scaled to 32-bits,
    			                // which allows the key to be used without expansion
    			                subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31);
    			                for (var i = 1; i < 7; i++) {
    			                    subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3);
    			                }
    			                subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
    			            }

    			            // Compute inverse subkeys
    			            var invSubKeys = this._invSubKeys = [];
    			            for (var i = 0; i < 16; i++) {
    			                invSubKeys[i] = subKeys[15 - i];
    			            }
    			        },

    			        encryptBlock: function (M, offset) {
    			            this._doCryptBlock(M, offset, this._subKeys);
    			        },

    			        decryptBlock: function (M, offset) {
    			            this._doCryptBlock(M, offset, this._invSubKeys);
    			        },

    			        _doCryptBlock: function (M, offset, subKeys) {
    			            // Get input
    			            this._lBlock = M[offset];
    			            this._rBlock = M[offset + 1];

    			            // Initial permutation
    			            exchangeLR.call(this, 4,  0x0f0f0f0f);
    			            exchangeLR.call(this, 16, 0x0000ffff);
    			            exchangeRL.call(this, 2,  0x33333333);
    			            exchangeRL.call(this, 8,  0x00ff00ff);
    			            exchangeLR.call(this, 1,  0x55555555);

    			            // Rounds
    			            for (var round = 0; round < 16; round++) {
    			                // Shortcuts
    			                var subKey = subKeys[round];
    			                var lBlock = this._lBlock;
    			                var rBlock = this._rBlock;

    			                // Feistel function
    			                var f = 0;
    			                for (var i = 0; i < 8; i++) {
    			                    f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
    			                }
    			                this._lBlock = rBlock;
    			                this._rBlock = lBlock ^ f;
    			            }

    			            // Undo swap from last round
    			            var t = this._lBlock;
    			            this._lBlock = this._rBlock;
    			            this._rBlock = t;

    			            // Final permutation
    			            exchangeLR.call(this, 1,  0x55555555);
    			            exchangeRL.call(this, 8,  0x00ff00ff);
    			            exchangeRL.call(this, 2,  0x33333333);
    			            exchangeLR.call(this, 16, 0x0000ffff);
    			            exchangeLR.call(this, 4,  0x0f0f0f0f);

    			            // Set output
    			            M[offset] = this._lBlock;
    			            M[offset + 1] = this._rBlock;
    			        },

    			        keySize: 64/32,

    			        ivSize: 64/32,

    			        blockSize: 64/32
    			    });

    			    // Swap bits across the left and right words
    			    function exchangeLR(offset, mask) {
    			        var t = ((this._lBlock >>> offset) ^ this._rBlock) & mask;
    			        this._rBlock ^= t;
    			        this._lBlock ^= t << offset;
    			    }

    			    function exchangeRL(offset, mask) {
    			        var t = ((this._rBlock >>> offset) ^ this._lBlock) & mask;
    			        this._lBlock ^= t;
    			        this._rBlock ^= t << offset;
    			    }

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
    			     */
    			    C.DES = BlockCipher._createHelper(DES);

    			    /**
    			     * Triple-DES block cipher algorithm.
    			     */
    			    var TripleDES = C_algo.TripleDES = BlockCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var key = this._key;
    			            var keyWords = key.words;
    			            // Make sure the key length is valid (64, 128 or >= 192 bit)
    			            if (keyWords.length !== 2 && keyWords.length !== 4 && keyWords.length < 6) {
    			                throw new Error('Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.');
    			            }

    			            // Extend the key according to the keying options defined in 3DES standard
    			            var key1 = keyWords.slice(0, 2);
    			            var key2 = keyWords.length < 4 ? keyWords.slice(0, 2) : keyWords.slice(2, 4);
    			            var key3 = keyWords.length < 6 ? keyWords.slice(0, 2) : keyWords.slice(4, 6);

    			            // Create DES instances
    			            this._des1 = DES.createEncryptor(WordArray.create(key1));
    			            this._des2 = DES.createEncryptor(WordArray.create(key2));
    			            this._des3 = DES.createEncryptor(WordArray.create(key3));
    			        },

    			        encryptBlock: function (M, offset) {
    			            this._des1.encryptBlock(M, offset);
    			            this._des2.decryptBlock(M, offset);
    			            this._des3.encryptBlock(M, offset);
    			        },

    			        decryptBlock: function (M, offset) {
    			            this._des3.decryptBlock(M, offset);
    			            this._des2.encryptBlock(M, offset);
    			            this._des1.decryptBlock(M, offset);
    			        },

    			        keySize: 192/32,

    			        ivSize: 64/32,

    			        blockSize: 64/32
    			    });

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
    			     */
    			    C.TripleDES = BlockCipher._createHelper(TripleDES);
    			}());


    			return CryptoJS.TripleDES;

    		}));
    } (tripledes));
    	return tripledes.exports;
    }

    var rc4 = {exports: {}};

    var hasRequiredRc4;

    function requireRc4 () {
    	if (hasRequiredRc4) return rc4.exports;
    	hasRequiredRc4 = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var StreamCipher = C_lib.StreamCipher;
    			    var C_algo = C.algo;

    			    /**
    			     * RC4 stream cipher algorithm.
    			     */
    			    var RC4 = C_algo.RC4 = StreamCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var key = this._key;
    			            var keyWords = key.words;
    			            var keySigBytes = key.sigBytes;

    			            // Init sbox
    			            var S = this._S = [];
    			            for (var i = 0; i < 256; i++) {
    			                S[i] = i;
    			            }

    			            // Key setup
    			            for (var i = 0, j = 0; i < 256; i++) {
    			                var keyByteIndex = i % keySigBytes;
    			                var keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff;

    			                j = (j + S[i] + keyByte) % 256;

    			                // Swap
    			                var t = S[i];
    			                S[i] = S[j];
    			                S[j] = t;
    			            }

    			            // Counters
    			            this._i = this._j = 0;
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            M[offset] ^= generateKeystreamWord.call(this);
    			        },

    			        keySize: 256/32,

    			        ivSize: 0
    			    });

    			    function generateKeystreamWord() {
    			        // Shortcuts
    			        var S = this._S;
    			        var i = this._i;
    			        var j = this._j;

    			        // Generate keystream word
    			        var keystreamWord = 0;
    			        for (var n = 0; n < 4; n++) {
    			            i = (i + 1) % 256;
    			            j = (j + S[i]) % 256;

    			            // Swap
    			            var t = S[i];
    			            S[i] = S[j];
    			            S[j] = t;

    			            keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8);
    			        }

    			        // Update counters
    			        this._i = i;
    			        this._j = j;

    			        return keystreamWord;
    			    }

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
    			     */
    			    C.RC4 = StreamCipher._createHelper(RC4);

    			    /**
    			     * Modified RC4 stream cipher algorithm.
    			     */
    			    var RC4Drop = C_algo.RC4Drop = RC4.extend({
    			        /**
    			         * Configuration options.
    			         *
    			         * @property {number} drop The number of keystream words to drop. Default 192
    			         */
    			        cfg: RC4.cfg.extend({
    			            drop: 192
    			        }),

    			        _doReset: function () {
    			            RC4._doReset.call(this);

    			            // Drop
    			            for (var i = this.cfg.drop; i > 0; i--) {
    			                generateKeystreamWord.call(this);
    			            }
    			        }
    			    });

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
    			     */
    			    C.RC4Drop = StreamCipher._createHelper(RC4Drop);
    			}());


    			return CryptoJS.RC4;

    		}));
    } (rc4));
    	return rc4.exports;
    }

    var rabbit = {exports: {}};

    var hasRequiredRabbit;

    function requireRabbit () {
    	if (hasRequiredRabbit) return rabbit.exports;
    	hasRequiredRabbit = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var StreamCipher = C_lib.StreamCipher;
    			    var C_algo = C.algo;

    			    // Reusable objects
    			    var S  = [];
    			    var C_ = [];
    			    var G  = [];

    			    /**
    			     * Rabbit stream cipher algorithm
    			     */
    			    var Rabbit = C_algo.Rabbit = StreamCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var K = this._key.words;
    			            var iv = this.cfg.iv;

    			            // Swap endian
    			            for (var i = 0; i < 4; i++) {
    			                K[i] = (((K[i] << 8)  | (K[i] >>> 24)) & 0x00ff00ff) |
    			                       (((K[i] << 24) | (K[i] >>> 8))  & 0xff00ff00);
    			            }

    			            // Generate initial state values
    			            var X = this._X = [
    			                K[0], (K[3] << 16) | (K[2] >>> 16),
    			                K[1], (K[0] << 16) | (K[3] >>> 16),
    			                K[2], (K[1] << 16) | (K[0] >>> 16),
    			                K[3], (K[2] << 16) | (K[1] >>> 16)
    			            ];

    			            // Generate initial counter values
    			            var C = this._C = [
    			                (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
    			                (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
    			                (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
    			                (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
    			            ];

    			            // Carry bit
    			            this._b = 0;

    			            // Iterate the system four times
    			            for (var i = 0; i < 4; i++) {
    			                nextState.call(this);
    			            }

    			            // Modify the counters
    			            for (var i = 0; i < 8; i++) {
    			                C[i] ^= X[(i + 4) & 7];
    			            }

    			            // IV setup
    			            if (iv) {
    			                // Shortcuts
    			                var IV = iv.words;
    			                var IV_0 = IV[0];
    			                var IV_1 = IV[1];

    			                // Generate four subvectors
    			                var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
    			                var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
    			                var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
    			                var i3 = (i2 << 16)  | (i0 & 0x0000ffff);

    			                // Modify counter values
    			                C[0] ^= i0;
    			                C[1] ^= i1;
    			                C[2] ^= i2;
    			                C[3] ^= i3;
    			                C[4] ^= i0;
    			                C[5] ^= i1;
    			                C[6] ^= i2;
    			                C[7] ^= i3;

    			                // Iterate the system four times
    			                for (var i = 0; i < 4; i++) {
    			                    nextState.call(this);
    			                }
    			            }
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcut
    			            var X = this._X;

    			            // Iterate the system
    			            nextState.call(this);

    			            // Generate four keystream words
    			            S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
    			            S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
    			            S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
    			            S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

    			            for (var i = 0; i < 4; i++) {
    			                // Swap endian
    			                S[i] = (((S[i] << 8)  | (S[i] >>> 24)) & 0x00ff00ff) |
    			                       (((S[i] << 24) | (S[i] >>> 8))  & 0xff00ff00);

    			                // Encrypt
    			                M[offset + i] ^= S[i];
    			            }
    			        },

    			        blockSize: 128/32,

    			        ivSize: 64/32
    			    });

    			    function nextState() {
    			        // Shortcuts
    			        var X = this._X;
    			        var C = this._C;

    			        // Save old counter values
    			        for (var i = 0; i < 8; i++) {
    			            C_[i] = C[i];
    			        }

    			        // Calculate new counter values
    			        C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
    			        C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
    			        C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
    			        C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
    			        C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
    			        C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
    			        C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
    			        C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
    			        this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

    			        // Calculate the g-values
    			        for (var i = 0; i < 8; i++) {
    			            var gx = X[i] + C[i];

    			            // Construct high and low argument for squaring
    			            var ga = gx & 0xffff;
    			            var gb = gx >>> 16;

    			            // Calculate high and low result of squaring
    			            var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
    			            var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

    			            // High XOR low
    			            G[i] = gh ^ gl;
    			        }

    			        // Calculate new state values
    			        X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
    			        X[1] = (G[1] + ((G[0] << 8)  | (G[0] >>> 24)) + G[7]) | 0;
    			        X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
    			        X[3] = (G[3] + ((G[2] << 8)  | (G[2] >>> 24)) + G[1]) | 0;
    			        X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
    			        X[5] = (G[5] + ((G[4] << 8)  | (G[4] >>> 24)) + G[3]) | 0;
    			        X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
    			        X[7] = (G[7] + ((G[6] << 8)  | (G[6] >>> 24)) + G[5]) | 0;
    			    }

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.Rabbit.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.Rabbit.decrypt(ciphertext, key, cfg);
    			     */
    			    C.Rabbit = StreamCipher._createHelper(Rabbit);
    			}());


    			return CryptoJS.Rabbit;

    		}));
    } (rabbit));
    	return rabbit.exports;
    }

    var rabbitLegacy = {exports: {}};

    var hasRequiredRabbitLegacy;

    function requireRabbitLegacy () {
    	if (hasRequiredRabbitLegacy) return rabbitLegacy.exports;
    	hasRequiredRabbitLegacy = 1;
    	(function (module, exports) {
    (function (root, factory, undef) {
    			{
    				// CommonJS
    				module.exports = factory(requireCore(), requireEncBase64(), requireMd5(), requireEvpkdf(), requireCipherCore());
    			}
    		}(commonjsGlobal, function (CryptoJS) {

    			(function () {
    			    // Shortcuts
    			    var C = CryptoJS;
    			    var C_lib = C.lib;
    			    var StreamCipher = C_lib.StreamCipher;
    			    var C_algo = C.algo;

    			    // Reusable objects
    			    var S  = [];
    			    var C_ = [];
    			    var G  = [];

    			    /**
    			     * Rabbit stream cipher algorithm.
    			     *
    			     * This is a legacy version that neglected to convert the key to little-endian.
    			     * This error doesn't affect the cipher's security,
    			     * but it does affect its compatibility with other implementations.
    			     */
    			    var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
    			        _doReset: function () {
    			            // Shortcuts
    			            var K = this._key.words;
    			            var iv = this.cfg.iv;

    			            // Generate initial state values
    			            var X = this._X = [
    			                K[0], (K[3] << 16) | (K[2] >>> 16),
    			                K[1], (K[0] << 16) | (K[3] >>> 16),
    			                K[2], (K[1] << 16) | (K[0] >>> 16),
    			                K[3], (K[2] << 16) | (K[1] >>> 16)
    			            ];

    			            // Generate initial counter values
    			            var C = this._C = [
    			                (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
    			                (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
    			                (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
    			                (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
    			            ];

    			            // Carry bit
    			            this._b = 0;

    			            // Iterate the system four times
    			            for (var i = 0; i < 4; i++) {
    			                nextState.call(this);
    			            }

    			            // Modify the counters
    			            for (var i = 0; i < 8; i++) {
    			                C[i] ^= X[(i + 4) & 7];
    			            }

    			            // IV setup
    			            if (iv) {
    			                // Shortcuts
    			                var IV = iv.words;
    			                var IV_0 = IV[0];
    			                var IV_1 = IV[1];

    			                // Generate four subvectors
    			                var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
    			                var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
    			                var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
    			                var i3 = (i2 << 16)  | (i0 & 0x0000ffff);

    			                // Modify counter values
    			                C[0] ^= i0;
    			                C[1] ^= i1;
    			                C[2] ^= i2;
    			                C[3] ^= i3;
    			                C[4] ^= i0;
    			                C[5] ^= i1;
    			                C[6] ^= i2;
    			                C[7] ^= i3;

    			                // Iterate the system four times
    			                for (var i = 0; i < 4; i++) {
    			                    nextState.call(this);
    			                }
    			            }
    			        },

    			        _doProcessBlock: function (M, offset) {
    			            // Shortcut
    			            var X = this._X;

    			            // Iterate the system
    			            nextState.call(this);

    			            // Generate four keystream words
    			            S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
    			            S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
    			            S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
    			            S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

    			            for (var i = 0; i < 4; i++) {
    			                // Swap endian
    			                S[i] = (((S[i] << 8)  | (S[i] >>> 24)) & 0x00ff00ff) |
    			                       (((S[i] << 24) | (S[i] >>> 8))  & 0xff00ff00);

    			                // Encrypt
    			                M[offset + i] ^= S[i];
    			            }
    			        },

    			        blockSize: 128/32,

    			        ivSize: 64/32
    			    });

    			    function nextState() {
    			        // Shortcuts
    			        var X = this._X;
    			        var C = this._C;

    			        // Save old counter values
    			        for (var i = 0; i < 8; i++) {
    			            C_[i] = C[i];
    			        }

    			        // Calculate new counter values
    			        C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
    			        C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
    			        C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
    			        C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
    			        C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
    			        C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
    			        C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
    			        C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
    			        this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

    			        // Calculate the g-values
    			        for (var i = 0; i < 8; i++) {
    			            var gx = X[i] + C[i];

    			            // Construct high and low argument for squaring
    			            var ga = gx & 0xffff;
    			            var gb = gx >>> 16;

    			            // Calculate high and low result of squaring
    			            var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
    			            var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

    			            // High XOR low
    			            G[i] = gh ^ gl;
    			        }

    			        // Calculate new state values
    			        X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
    			        X[1] = (G[1] + ((G[0] << 8)  | (G[0] >>> 24)) + G[7]) | 0;
    			        X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
    			        X[3] = (G[3] + ((G[2] << 8)  | (G[2] >>> 24)) + G[1]) | 0;
    			        X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
    			        X[5] = (G[5] + ((G[4] << 8)  | (G[4] >>> 24)) + G[3]) | 0;
    			        X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
    			        X[7] = (G[7] + ((G[6] << 8)  | (G[6] >>> 24)) + G[5]) | 0;
    			    }

    			    /**
    			     * Shortcut functions to the cipher's object interface.
    			     *
    			     * @example
    			     *
    			     *     var ciphertext = CryptoJS.RabbitLegacy.encrypt(message, key, cfg);
    			     *     var plaintext  = CryptoJS.RabbitLegacy.decrypt(ciphertext, key, cfg);
    			     */
    			    C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
    			}());


    			return CryptoJS.RabbitLegacy;

    		}));
    } (rabbitLegacy));
    	return rabbitLegacy.exports;
    }

    (function (module, exports) {
    (function (root, factory, undef) {
    		{
    			// CommonJS
    			module.exports = factory(requireCore(), requireX64Core(), requireLibTypedarrays(), requireEncUtf16(), requireEncBase64(), requireEncBase64url(), requireMd5(), requireSha1(), requireSha256(), requireSha224(), requireSha512(), requireSha384(), requireSha3(), requireRipemd160(), requireHmac(), requirePbkdf2(), requireEvpkdf(), requireCipherCore(), requireModeCfb(), requireModeCtr(), requireModeCtrGladman(), requireModeOfb(), requireModeEcb(), requirePadAnsix923(), requirePadIso10126(), requirePadIso97971(), requirePadZeropadding(), requirePadNopadding(), requireFormatHex(), requireAes(), requireTripledes(), requireRc4(), requireRabbit(), requireRabbitLegacy());
    		}
    	}(commonjsGlobal, function (CryptoJS) {

    		return CryptoJS;

    	}));
    } (cryptoJs));

    var CryptoJS = cryptoJs.exports;

    async function qrCodeReader () {
        console.log("loaded: qr code scanner");

        let robotoMono = await fetch(robotoMonoB64);
        robotoMono = new FontFace("roboto-mono", await robotoMono.arrayBuffer());
        await robotoMono.load();
        document.fonts.add(robotoMono);
        let cams = await e.listCameras(true);

        let qrScanner;
        let lastResults;
        let lastResultsRow;
        let lastResultsOriginalBackground;
        let password = "";

        const camsSelect = document.createElement("select");
        camsSelect.innerText = "test";
        for (let cam of cams) {
            let option = document.createElement("option");
            option.innerText = cam.label;
            option.value = cam.id;
            camsSelect.appendChild(option);
        }
        camsSelect.addEventListener("change", (e) => {
            if (qrScanner) {
                qrScanner.setCamera(e.target.value);
            }
        });

        const startScan = () => {
            startBtn.disabled = true;
            endBtn.disabled = false;
            if (qrScanner) return;
            password = document.querySelector("#password-input").value;
            console.log(password);
            qrScanner = new e(document.querySelector("#videoElement"), handleResults, {
                calculateScanRegion: (video) => {
                    video.videoHeight / video.videoWidth;
                    return {
                        x: 0,
                        y: 0,
                        width: video.videoWidth,
                        height: video.videoHeight,
                        // downScaledWidth: 400,
                        // downScaledHeight: Math.round(400*ratio)
                    };
                },
            });
            if (cams.length > 0) {
                qrScanner.setCamera(camsSelect.value);
            }
            qrScanner.start();
        };

        const endScan = () => {
            startBtn.disabled = false;
            endBtn.disabled = true;
            if (!qrScanner) return;
            qrScanner.destroy();
            qrScanner = null;
            lastResults = null;
            detailsDiv.innerHTML = "";
        };

        const clearResults = () => {
            lastResults = null;
            detailsDiv.innerHTML = "";
            if (lastResultsRow) {
                lastResultsRow.style.background = lastResultsOriginalBackground;
                lastResultsRow = null;
                lastResultsOriginalBackground = null;
            }
        };

        const body = document.querySelector("body");

        let rows = document.querySelectorAll("form tr");

        const readerContainer = document.createElement("div");
        readerContainer.style.position = "fixed";
        readerContainer.style.width = "calc(50vw - 450px)";
        readerContainer.style.bottom = "20px";
        readerContainer.style.left = "20px";
        readerContainer.style.background = "white";

        const readerVideo = document.createElement("video");
        readerVideo.id = "videoElement";
        readerVideo.style.width = "100%";

        const detailsDiv = document.createElement("div");

        const passwordInput = document.createElement("input");
        passwordInput.type = "password";
        passwordInput.id = "password-input";

        const passwordInputLabel = document.createElement("label");
        passwordInputLabel.innerText = "Password";
        passwordInputLabel.for = "password-input";

        const startBtn = document.createElement("button");
        startBtn.innerText = "Start";
        startBtn.addEventListener("click", startScan);

        const endBtn = document.createElement("button");
        endBtn.innerText = "Stop";
        endBtn.disabled = true;
        endBtn.addEventListener("click", endScan);

        const clearBtn = document.createElement("button");
        clearBtn.innerText = "Clear";
        clearBtn.addEventListener("click", clearResults);

        readerContainer.appendChild(readerVideo);
        readerContainer.appendChild(detailsDiv);
        readerContainer.appendChild(camsSelect);
        readerContainer.appendChild(document.createElement("br"));
        readerContainer.appendChild(passwordInputLabel);
        readerContainer.appendChild(passwordInput);
        readerContainer.appendChild(document.createElement("br"));
        readerContainer.appendChild(startBtn);
        readerContainer.appendChild(endBtn);
        readerContainer.appendChild(clearBtn);
        body.appendChild(readerContainer);

        body.addEventListener("keydown", (e) => {
            console.log(e);
        });

        const createP = (pText) => {
            let p = document.createElement("p");
            p.innerText = pText;
            p.style.fontFamily = "roboto-mono";
            p.style.fontWeight = 600;
            p.style.paddingLeft = "10px";
            p.style.wordBreak = "break-all";

            return p;
        };

        const updateDetails = (info) => {
            detailsDiv.innerHTML = "";
            let fields = ["Student ID", "Student Name", "Exam Name", "Exam Date"];
            for (let field of fields) {
                detailsDiv.appendChild(createP(`${field}: ${info[field]}`));
            }
        };

        const setError = (errorText, clear = false) => {
            if (clear) {
                detailsDiv.innerHTML = "";
            }
            let p = createP(errorText);
            p.style.color = "red";
            detailsDiv.appendChild(p);
        };

        const handleResults = (result) => {
            if (result.data == lastResults) {
                return;
            }

            clearResults();

            lastResults = result.data;
            result = result.data.split(";");
            // result = ['121121033', 'AHMED FARHAN SAEED', 'ddd', 'fff']
            if (result.length < 3) {
                console.log(result);
                setError("QR Code is malformed or reading failed", true);
                return;
            }
            let studentDecryptedInfo;

            studentDecryptedInfo = CryptoJS.AES.decrypt(result[0], password).toString(CryptoJS.enc.Utf8);
            console.log(`"${studentDecryptedInfo}"`);
            if (studentDecryptedInfo.length < 1 || !/\d+;[a-zA-Z ]+/.test(studentDecryptedInfo)) {
                setError("password is incorrect");
                console.log(studentDecryptedInfo);
                return;
            }
            studentDecryptedInfo = studentDecryptedInfo.split(";");

            let info = {
                "Student ID": studentDecryptedInfo[0],
                "Student Name": studentDecryptedInfo[1],
                "Exam Name": result[1],
                "Exam Date": result[2],
            };
            updateDetails(info);
            let found = false;
            for (let row of rows) {
                let input = row.querySelector("input");
                let id = row.querySelector(":nth-child(2)");
                let name = row.querySelector(":nth-child(3)");

                if (!id || !name || !input) {
                    continue;
                }

                let idText = id.innerText;
                name.innerText;

                if (idText == info["Student ID"]) {
                    found = true;
                    input.select();

                    lastResultsRow = row;
                    lastResultsOriginalBackground = id.bgColor;
                    for (let cell of lastResultsRow.querySelectorAll("td")) {
                        cell.removeAttribute("bgcolor");
                    }
                    row.style.background = "lightgreen";
                    detailsDiv.style.background = "lightgreen";
                    setTimeout(() => {
                        detailsDiv.style.background = "white";
                    }, 1000);
                    break;
                }
            }
            if (!found) {
                for (let row of rows) {
                    let input = row.querySelector("input");
                    if (input) {
                        input.blur();
                    }
                }
                setError("Student was not found in PIS list");
            }
        };
    }

    function mainPageRedirector() {
        console.log('main page working');
        window.location = 'https://pis.tiu.edu.iq/page/index.php';
    }

    function easyQuota() {
        const courseList = document.querySelector("ul");
        const coursesLi = courseList.querySelectorAll("li");

        let courses = Array.from(coursesLi).map((li) => {
            let a = li.querySelector("a");
            let url = new URL(a.href);
            let name = a.innerText;

            let code = url.searchParams.get("dk");
            let section = url.searchParams.get("sube");

            return {
                url,
                name,
                li,
                code,
                section,
            };
        });
        
        courses.forEach((course) => {
            const departmentQuota = document.createElement("input");
            const facultyQuota = document.createElement("input");
            const totalQuota = document.createElement("input");

            const editBtn = document.createElement("button");

            const updateAmount = async (e) => {
                editBtn.innerText = "updating ...";
                editBtn.disabled = true;

                departmentQuota.disabled = true;
                facultyQuota.disabled = true;
                totalQuota.disabled = true;

                await fetch(course.url, {
                    method: "POST",
                    mode: "cors",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: encodeURI(
                        `bkon[1739]=${departmentQuota.value}&kon[418]=${facultyQuota.value}&toplam=${totalQuota.value}&konsubmit=OK&dk=${course.code}&sube=${course.section}`
                    ),
                });

                editBtn.disabled = false;
                editBtn.innerText = "edit";
                editBtn.removeEventListener("click", updateAmount);
                editBtn.addEventListener("click", getData);
            };

            const getData = async (e) => {
                let parsedData = await (await fetch(course.url)).text();
                let data = document.createElement("div");
                data.innerHTML = parsedData;

                const oldDepratmentQuota = parseInt(
                    data.querySelector('input[name="bkon[1739]"]').value
                );
                const oldFacultyQuota = parseInt(
                    data.querySelector('input[name="kon[418]"]').value
                );
                const oldTotalQuota = parseInt(
                    data.querySelector('input[name="toplam"]').value
                );

                departmentQuota.value = oldDepratmentQuota;
                facultyQuota.value = oldFacultyQuota;
                totalQuota.value = oldTotalQuota;

                departmentQuota.disabled = false;
                facultyQuota.disabled = false;
                totalQuota.disabled = false;

                e.target.removeEventListener("click", getData);
                e.target.innerText = "update";
                e.target.addEventListener("click", updateAmount);
            };

            departmentQuota.type = "text";
            departmentQuota.style.width = "2em";
            departmentQuota.style["margin-inline"] = "3px";
            departmentQuota.style["margin-block"] = "3px";
            departmentQuota.disabled = true;
            course.li.insertBefore(departmentQuota, course.li.firstChild);

            facultyQuota.type = "text";
            facultyQuota.style.width = "2em";
            facultyQuota.style["margin-inline"] = "3px";
            facultyQuota.style["margin-block"] = "3px";
            facultyQuota.disabled = true;
            course.li.insertBefore(facultyQuota, departmentQuota.nextSibling);

            totalQuota.type = "text";
            totalQuota.style.width = "2em";
            totalQuota.style["margin-inline"] = "3px";
            totalQuota.style["margin-block"] = "3px";
            totalQuota.disabled = true;
            course.li.insertBefore(totalQuota, facultyQuota.nextSibling);

            editBtn.innerText = "edit";
            editBtn.style.width = "7em";
            editBtn.addEventListener("click", getData);
            course.li.insertBefore(editBtn, course.li.firstChild);
        });
    }

    async function showAllCourses() {
        const href = window.location.href;
        const firstGradeCoursesUrl = href + '&firstgrades=1';

        let res = await fetch(firstGradeCoursesUrl);
        res = await res.text();

        const div = document.createElement('div');
        div.innerHTML = res;

        let courses = div.querySelectorAll('#table_data > tbody > tr');
        courses = Array.from(courses);

        const coursesTable = document.querySelector('#table_data > tbody');

        for(let course of courses) {
            coursesTable.appendChild(course);
        }
    }

    const href = window.location.href;
    if (href.startsWith("https://pis.tiu.edu.iq/page/index.php")) {
        namesDownloaderHomePage();
    }
    else if (href.startsWith("https://pis.tiu.edu.iq/page/grp210stats.php")) {
        // todo: refactor thos better
        showAllCourses().then(namesDownloaderCourseManagement);
    } else if (href.startsWith("https://pis.tiu.edu.iq/page/grp20152.fhtml") || href.endsWith("grp20152.html")) {
        qrCodeReader();
    } else if (href.startsWith("https://pis.tiu.edu.iq/index1.html")) {
        mainPageRedirector();
    } else if (href.startsWith('https://pis.tiu.edu.iq/page/grp720.php?bkbno=1739')) {
        easyQuota();
    } else if (href.startsWith('https://pis.tiu.edu.iq/page/grp201.php')) {
        namesDownloaderExamComittee();
    }

    const createWorker=()=>new Worker(URL.createObjectURL(new Blob([`class x{constructor(a,b){this.width=b;this.height=a.length/b;this.data=a}static createEmpty(a,b){return new x(new Uint8ClampedArray(a*b),a)}get(a,b){return 0>a||a>=this.width||0>b||b>=this.height?!1:!!this.data[b*this.width+a]}set(a,b,c){this.data[b*this.width+a]=c?1:0}setRegion(a,b,c,d,e){for(let f=b;f<b+d;f++)for(let g=a;g<a+c;g++)this.set(g,f,!!e)}}
class A{constructor(a,b,c){this.width=a;a*=b;if(c&&c.length!==a)throw Error("Wrong buffer size");this.data=c||new Uint8ClampedArray(a)}get(a,b){return this.data[b*this.width+a]}set(a,b,c){this.data[b*this.width+a]=c}}
class ba{constructor(a){this.bitOffset=this.byteOffset=0;this.bytes=a}readBits(a){if(1>a||32<a||a>this.available())throw Error("Cannot read "+a.toString()+" bits");var b=0;if(0<this.bitOffset){b=8-this.bitOffset;var c=a<b?a:b;b-=c;b=(this.bytes[this.byteOffset]&255>>8-c<<b)>>b;a-=c;this.bitOffset+=c;8===this.bitOffset&&(this.bitOffset=0,this.byteOffset++)}if(0<a){for(;8<=a;)b=b<<8|this.bytes[this.byteOffset]&255,this.byteOffset++,a-=8;0<a&&(c=8-a,b=b<<a|(this.bytes[this.byteOffset]&255>>c<<c)>>c,
this.bitOffset+=a)}return b}available(){return 8*(this.bytes.length-this.byteOffset)-this.bitOffset}}var B,C=B||(B={});C.Numeric="numeric";C.Alphanumeric="alphanumeric";C.Byte="byte";C.Kanji="kanji";C.ECI="eci";C.StructuredAppend="structuredappend";var D,E=D||(D={});E[E.Terminator=0]="Terminator";E[E.Numeric=1]="Numeric";E[E.Alphanumeric=2]="Alphanumeric";E[E.Byte=4]="Byte";E[E.Kanji=8]="Kanji";E[E.ECI=7]="ECI";E[E.StructuredAppend=3]="StructuredAppend";let F="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".split("");
function ca(a,b){let c=[],d="";b=a.readBits([8,16,16][b]);for(let e=0;e<b;e++){let f=a.readBits(8);c.push(f)}try{d+=decodeURIComponent(c.map(e=>\`%\${("0"+e.toString(16)).substr(-2)}\`).join(""))}catch(e){}return{bytes:c,text:d}}
function da(a,b){a=new ba(a);let c=9>=b?0:26>=b?1:2;for(b={text:"",bytes:[],chunks:[],version:b};4<=a.available();){var d=a.readBits(4);if(d===D.Terminator)return b;if(d===D.ECI)0===a.readBits(1)?b.chunks.push({type:B.ECI,assignmentNumber:a.readBits(7)}):0===a.readBits(1)?b.chunks.push({type:B.ECI,assignmentNumber:a.readBits(14)}):0===a.readBits(1)?b.chunks.push({type:B.ECI,assignmentNumber:a.readBits(21)}):b.chunks.push({type:B.ECI,assignmentNumber:-1});else if(d===D.Numeric){var e=a,f=[];d="";for(var g=
e.readBits([10,12,14][c]);3<=g;){var h=e.readBits(10);if(1E3<=h)throw Error("Invalid numeric value above 999");var k=Math.floor(h/100),m=Math.floor(h/10)%10;h%=10;f.push(48+k,48+m,48+h);d+=k.toString()+m.toString()+h.toString();g-=3}if(2===g){g=e.readBits(7);if(100<=g)throw Error("Invalid numeric value above 99");e=Math.floor(g/10);g%=10;f.push(48+e,48+g);d+=e.toString()+g.toString()}else if(1===g){e=e.readBits(4);if(10<=e)throw Error("Invalid numeric value above 9");f.push(48+e);d+=e.toString()}b.text+=
d;b.bytes.push(...f);b.chunks.push({type:B.Numeric,text:d})}else if(d===D.Alphanumeric){e=a;f=[];d="";for(g=e.readBits([9,11,13][c]);2<=g;)m=e.readBits(11),k=Math.floor(m/45),m%=45,f.push(F[k].charCodeAt(0),F[m].charCodeAt(0)),d+=F[k]+F[m],g-=2;1===g&&(e=e.readBits(6),f.push(F[e].charCodeAt(0)),d+=F[e]);b.text+=d;b.bytes.push(...f);b.chunks.push({type:B.Alphanumeric,text:d})}else if(d===D.Byte)d=ca(a,c),b.text+=d.text,b.bytes.push(...d.bytes),b.chunks.push({type:B.Byte,bytes:d.bytes,text:d.text});
else if(d===D.Kanji){f=a;d=[];e=f.readBits([8,10,12][c]);for(g=0;g<e;g++)k=f.readBits(13),k=Math.floor(k/192)<<8|k%192,k=7936>k?k+33088:k+49472,d.push(k>>8,k&255);f=(new TextDecoder("shift-jis")).decode(Uint8Array.from(d));b.text+=f;b.bytes.push(...d);b.chunks.push({type:B.Kanji,bytes:d,text:f})}else d===D.StructuredAppend&&b.chunks.push({type:B.StructuredAppend,currentSequence:a.readBits(4),totalSequence:a.readBits(4),parity:a.readBits(8)})}if(0===a.available()||0===a.readBits(a.available()))return b}
class G{constructor(a,b){if(0===b.length)throw Error("No coefficients.");this.field=a;let c=b.length;if(1<c&&0===b[0]){let d=1;for(;d<c&&0===b[d];)d++;if(d===c)this.coefficients=a.zero.coefficients;else for(this.coefficients=new Uint8ClampedArray(c-d),a=0;a<this.coefficients.length;a++)this.coefficients[a]=b[d+a]}else this.coefficients=b}degree(){return this.coefficients.length-1}isZero(){return 0===this.coefficients[0]}getCoefficient(a){return this.coefficients[this.coefficients.length-1-a]}addOrSubtract(a){if(this.isZero())return a;
if(a.isZero())return this;let b=this.coefficients;a=a.coefficients;b.length>a.length&&([b,a]=[a,b]);let c=new Uint8ClampedArray(a.length),d=a.length-b.length;for(var e=0;e<d;e++)c[e]=a[e];for(e=d;e<a.length;e++)c[e]=b[e-d]^a[e];return new G(this.field,c)}multiply(a){if(0===a)return this.field.zero;if(1===a)return this;let b=this.coefficients.length,c=new Uint8ClampedArray(b);for(let d=0;d<b;d++)c[d]=this.field.multiply(this.coefficients[d],a);return new G(this.field,c)}multiplyPoly(a){if(this.isZero()||
a.isZero())return this.field.zero;let b=this.coefficients,c=b.length;a=a.coefficients;let d=a.length,e=new Uint8ClampedArray(c+d-1);for(let f=0;f<c;f++){let g=b[f];for(let h=0;h<d;h++)e[f+h]=H(e[f+h],this.field.multiply(g,a[h]))}return new G(this.field,e)}multiplyByMonomial(a,b){if(0>a)throw Error("Invalid degree less than 0");if(0===b)return this.field.zero;let c=this.coefficients.length;a=new Uint8ClampedArray(c+a);for(let d=0;d<c;d++)a[d]=this.field.multiply(this.coefficients[d],b);return new G(this.field,
a)}evaluateAt(a){let b=0;if(0===a)return this.getCoefficient(0);let c=this.coefficients.length;if(1===a)return this.coefficients.forEach(d=>{b^=d}),b;b=this.coefficients[0];for(let d=1;d<c;d++)b=H(this.field.multiply(a,b),this.coefficients[d]);return b}}function H(a,b){return a^b}
class ea{constructor(a,b,c){this.primitive=a;this.size=b;this.generatorBase=c;this.expTable=Array(this.size);this.logTable=Array(this.size);a=1;for(b=0;b<this.size;b++)this.expTable[b]=a,a*=2,a>=this.size&&(a=(a^this.primitive)&this.size-1);for(a=0;a<this.size-1;a++)this.logTable[this.expTable[a]]=a;this.zero=new G(this,Uint8ClampedArray.from([0]));this.one=new G(this,Uint8ClampedArray.from([1]))}multiply(a,b){return 0===a||0===b?0:this.expTable[(this.logTable[a]+this.logTable[b])%(this.size-1)]}inverse(a){if(0===
a)throw Error("Can't invert 0");return this.expTable[this.size-this.logTable[a]-1]}buildMonomial(a,b){if(0>a)throw Error("Invalid monomial degree less than 0");if(0===b)return this.zero;a=new Uint8ClampedArray(a+1);a[0]=b;return new G(this,a)}log(a){if(0===a)throw Error("Can't take log(0)");return this.logTable[a]}exp(a){return this.expTable[a]}}
function fa(a,b,c,d){b.degree()<c.degree()&&([b,c]=[c,b]);let e=a.zero;for(var f=a.one;c.degree()>=d/2;){var g=b;let h=e;b=c;e=f;if(b.isZero())return null;c=g;f=a.zero;g=b.getCoefficient(b.degree());for(g=a.inverse(g);c.degree()>=b.degree()&&!c.isZero();){let k=c.degree()-b.degree(),m=a.multiply(c.getCoefficient(c.degree()),g);f=f.addOrSubtract(a.buildMonomial(k,m));c=c.addOrSubtract(b.multiplyByMonomial(k,m))}f=f.multiplyPoly(e).addOrSubtract(h);if(c.degree()>=b.degree())return null}d=f.getCoefficient(0);
if(0===d)return null;a=a.inverse(d);return[f.multiply(a),c.multiply(a)]}
function ha(a,b){let c=new Uint8ClampedArray(a.length);c.set(a);a=new ea(285,256,0);var d=new G(a,c),e=new Uint8ClampedArray(b),f=!1;for(var g=0;g<b;g++){var h=d.evaluateAt(a.exp(g+a.generatorBase));e[e.length-1-g]=h;0!==h&&(f=!0)}if(!f)return c;d=new G(a,e);d=fa(a,a.buildMonomial(b,1),d,b);if(null===d)return null;b=d[0];g=b.degree();if(1===g)b=[b.getCoefficient(1)];else{e=Array(g);f=0;for(h=1;h<a.size&&f<g;h++)0===b.evaluateAt(h)&&(e[f]=a.inverse(h),f++);b=f!==g?null:e}if(null==b)return null;e=d[1];
f=b.length;d=Array(f);for(g=0;g<f;g++){h=a.inverse(b[g]);let k=1;for(let m=0;m<f;m++)g!==m&&(k=a.multiply(k,H(1,a.multiply(b[m],h))));d[g]=a.multiply(e.evaluateAt(h),a.inverse(k));0!==a.generatorBase&&(d[g]=a.multiply(d[g],h))}for(e=0;e<b.length;e++){f=c.length-1-a.log(b[e]);if(0>f)return null;c[f]^=d[e]}return c}
let I=[{infoBits:null,versionNumber:1,alignmentPatternCenters:[],errorCorrectionLevels:[{ecCodewordsPerBlock:7,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:19}]},{ecCodewordsPerBlock:10,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:16}]},{ecCodewordsPerBlock:13,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:13}]},{ecCodewordsPerBlock:17,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:9}]}]},{infoBits:null,versionNumber:2,alignmentPatternCenters:[6,18],errorCorrectionLevels:[{ecCodewordsPerBlock:10,ecBlocks:[{numBlocks:1,
dataCodewordsPerBlock:34}]},{ecCodewordsPerBlock:16,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:28}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:22}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:16}]}]},{infoBits:null,versionNumber:3,alignmentPatternCenters:[6,22],errorCorrectionLevels:[{ecCodewordsPerBlock:15,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:55}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:44}]},{ecCodewordsPerBlock:18,
ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:17}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:13}]}]},{infoBits:null,versionNumber:4,alignmentPatternCenters:[6,26],errorCorrectionLevels:[{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:80}]},{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:32}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:24}]},{ecCodewordsPerBlock:16,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:9}]}]},
{infoBits:null,versionNumber:5,alignmentPatternCenters:[6,30],errorCorrectionLevels:[{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:108}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:43}]},{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:15},{numBlocks:2,dataCodewordsPerBlock:16}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:11},{numBlocks:2,dataCodewordsPerBlock:12}]}]},{infoBits:null,versionNumber:6,alignmentPatternCenters:[6,
34],errorCorrectionLevels:[{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:68}]},{ecCodewordsPerBlock:16,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:27}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:19}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:15}]}]},{infoBits:31892,versionNumber:7,alignmentPatternCenters:[6,22,38],errorCorrectionLevels:[{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:78}]},{ecCodewordsPerBlock:18,
ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:31}]},{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:14},{numBlocks:4,dataCodewordsPerBlock:15}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:13},{numBlocks:1,dataCodewordsPerBlock:14}]}]},{infoBits:34236,versionNumber:8,alignmentPatternCenters:[6,24,42],errorCorrectionLevels:[{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:97}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:38},
{numBlocks:2,dataCodewordsPerBlock:39}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:18},{numBlocks:2,dataCodewordsPerBlock:19}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:14},{numBlocks:2,dataCodewordsPerBlock:15}]}]},{infoBits:39577,versionNumber:9,alignmentPatternCenters:[6,26,46],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:36},
{numBlocks:2,dataCodewordsPerBlock:37}]},{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:16},{numBlocks:4,dataCodewordsPerBlock:17}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:12},{numBlocks:4,dataCodewordsPerBlock:13}]}]},{infoBits:42195,versionNumber:10,alignmentPatternCenters:[6,28,50],errorCorrectionLevels:[{ecCodewordsPerBlock:18,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:68},{numBlocks:2,dataCodewordsPerBlock:69}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,
dataCodewordsPerBlock:43},{numBlocks:1,dataCodewordsPerBlock:44}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:19},{numBlocks:2,dataCodewordsPerBlock:20}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:15},{numBlocks:2,dataCodewordsPerBlock:16}]}]},{infoBits:48118,versionNumber:11,alignmentPatternCenters:[6,30,54],errorCorrectionLevels:[{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:81}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:1,
dataCodewordsPerBlock:50},{numBlocks:4,dataCodewordsPerBlock:51}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:22},{numBlocks:4,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:12},{numBlocks:8,dataCodewordsPerBlock:13}]}]},{infoBits:51042,versionNumber:12,alignmentPatternCenters:[6,32,58],errorCorrectionLevels:[{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:92},{numBlocks:2,dataCodewordsPerBlock:93}]},
{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:36},{numBlocks:2,dataCodewordsPerBlock:37}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:20},{numBlocks:6,dataCodewordsPerBlock:21}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:7,dataCodewordsPerBlock:14},{numBlocks:4,dataCodewordsPerBlock:15}]}]},{infoBits:55367,versionNumber:13,alignmentPatternCenters:[6,34,62],errorCorrectionLevels:[{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:107}]},
{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:37},{numBlocks:1,dataCodewordsPerBlock:38}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:20},{numBlocks:4,dataCodewordsPerBlock:21}]},{ecCodewordsPerBlock:22,ecBlocks:[{numBlocks:12,dataCodewordsPerBlock:11},{numBlocks:4,dataCodewordsPerBlock:12}]}]},{infoBits:58893,versionNumber:14,alignmentPatternCenters:[6,26,46,66],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:115},
{numBlocks:1,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:40},{numBlocks:5,dataCodewordsPerBlock:41}]},{ecCodewordsPerBlock:20,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:16},{numBlocks:5,dataCodewordsPerBlock:17}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:12},{numBlocks:5,dataCodewordsPerBlock:13}]}]},{infoBits:63784,versionNumber:15,alignmentPatternCenters:[6,26,48,70],errorCorrectionLevels:[{ecCodewordsPerBlock:22,
ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:87},{numBlocks:1,dataCodewordsPerBlock:88}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:41},{numBlocks:5,dataCodewordsPerBlock:42}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:24},{numBlocks:7,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:12},{numBlocks:7,dataCodewordsPerBlock:13}]}]},{infoBits:68472,versionNumber:16,alignmentPatternCenters:[6,26,50,
74],errorCorrectionLevels:[{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:98},{numBlocks:1,dataCodewordsPerBlock:99}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:7,dataCodewordsPerBlock:45},{numBlocks:3,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:15,dataCodewordsPerBlock:19},{numBlocks:2,dataCodewordsPerBlock:20}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:15},{numBlocks:13,dataCodewordsPerBlock:16}]}]},{infoBits:70749,
versionNumber:17,alignmentPatternCenters:[6,30,54,78],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:107},{numBlocks:5,dataCodewordsPerBlock:108}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:46},{numBlocks:1,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:22},{numBlocks:15,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:14},{numBlocks:17,
dataCodewordsPerBlock:15}]}]},{infoBits:76311,versionNumber:18,alignmentPatternCenters:[6,30,56,82],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:120},{numBlocks:1,dataCodewordsPerBlock:121}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:9,dataCodewordsPerBlock:43},{numBlocks:4,dataCodewordsPerBlock:44}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:22},{numBlocks:1,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:2,
dataCodewordsPerBlock:14},{numBlocks:19,dataCodewordsPerBlock:15}]}]},{infoBits:79154,versionNumber:19,alignmentPatternCenters:[6,30,58,86],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:113},{numBlocks:4,dataCodewordsPerBlock:114}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:44},{numBlocks:11,dataCodewordsPerBlock:45}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:21},{numBlocks:4,dataCodewordsPerBlock:22}]},
{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:9,dataCodewordsPerBlock:13},{numBlocks:16,dataCodewordsPerBlock:14}]}]},{infoBits:84390,versionNumber:20,alignmentPatternCenters:[6,34,62,90],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:107},{numBlocks:5,dataCodewordsPerBlock:108}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:41},{numBlocks:13,dataCodewordsPerBlock:42}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:15,dataCodewordsPerBlock:24},
{numBlocks:5,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:15,dataCodewordsPerBlock:15},{numBlocks:10,dataCodewordsPerBlock:16}]}]},{infoBits:87683,versionNumber:21,alignmentPatternCenters:[6,28,50,72,94],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:116},{numBlocks:4,dataCodewordsPerBlock:117}]},{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:42}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:22},
{numBlocks:6,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:19,dataCodewordsPerBlock:16},{numBlocks:6,dataCodewordsPerBlock:17}]}]},{infoBits:92361,versionNumber:22,alignmentPatternCenters:[6,26,50,74,98],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:111},{numBlocks:7,dataCodewordsPerBlock:112}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:7,dataCodewordsPerBlock:24},
{numBlocks:16,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:24,ecBlocks:[{numBlocks:34,dataCodewordsPerBlock:13}]}]},{infoBits:96236,versionNumber:23,alignmentPatternCenters:[6,30,54,74,102],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:121},{numBlocks:5,dataCodewordsPerBlock:122}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:47},{numBlocks:14,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:24},
{numBlocks:14,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:16,dataCodewordsPerBlock:15},{numBlocks:14,dataCodewordsPerBlock:16}]}]},{infoBits:102084,versionNumber:24,alignmentPatternCenters:[6,28,54,80,106],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:117},{numBlocks:4,dataCodewordsPerBlock:118}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:45},{numBlocks:14,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,
ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:24},{numBlocks:16,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:30,dataCodewordsPerBlock:16},{numBlocks:2,dataCodewordsPerBlock:17}]}]},{infoBits:102881,versionNumber:25,alignmentPatternCenters:[6,32,58,84,110],errorCorrectionLevels:[{ecCodewordsPerBlock:26,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:106},{numBlocks:4,dataCodewordsPerBlock:107}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:47},{numBlocks:13,
dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:7,dataCodewordsPerBlock:24},{numBlocks:22,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:22,dataCodewordsPerBlock:15},{numBlocks:13,dataCodewordsPerBlock:16}]}]},{infoBits:110507,versionNumber:26,alignmentPatternCenters:[6,30,58,86,114],errorCorrectionLevels:[{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:114},{numBlocks:2,dataCodewordsPerBlock:115}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:19,
dataCodewordsPerBlock:46},{numBlocks:4,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:28,dataCodewordsPerBlock:22},{numBlocks:6,dataCodewordsPerBlock:23}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:33,dataCodewordsPerBlock:16},{numBlocks:4,dataCodewordsPerBlock:17}]}]},{infoBits:110734,versionNumber:27,alignmentPatternCenters:[6,34,62,90,118],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:122},{numBlocks:4,dataCodewordsPerBlock:123}]},
{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:22,dataCodewordsPerBlock:45},{numBlocks:3,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:8,dataCodewordsPerBlock:23},{numBlocks:26,dataCodewordsPerBlock:24}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:12,dataCodewordsPerBlock:15},{numBlocks:28,dataCodewordsPerBlock:16}]}]},{infoBits:117786,versionNumber:28,alignmentPatternCenters:[6,26,50,74,98,122],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:117},
{numBlocks:10,dataCodewordsPerBlock:118}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:3,dataCodewordsPerBlock:45},{numBlocks:23,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:4,dataCodewordsPerBlock:24},{numBlocks:31,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:15},{numBlocks:31,dataCodewordsPerBlock:16}]}]},{infoBits:119615,versionNumber:29,alignmentPatternCenters:[6,30,54,78,102,126],errorCorrectionLevels:[{ecCodewordsPerBlock:30,
ecBlocks:[{numBlocks:7,dataCodewordsPerBlock:116},{numBlocks:7,dataCodewordsPerBlock:117}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:21,dataCodewordsPerBlock:45},{numBlocks:7,dataCodewordsPerBlock:46}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:1,dataCodewordsPerBlock:23},{numBlocks:37,dataCodewordsPerBlock:24}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:19,dataCodewordsPerBlock:15},{numBlocks:26,dataCodewordsPerBlock:16}]}]},{infoBits:126325,versionNumber:30,alignmentPatternCenters:[6,
26,52,78,104,130],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:5,dataCodewordsPerBlock:115},{numBlocks:10,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:19,dataCodewordsPerBlock:47},{numBlocks:10,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:15,dataCodewordsPerBlock:24},{numBlocks:25,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:23,dataCodewordsPerBlock:15},{numBlocks:25,dataCodewordsPerBlock:16}]}]},
{infoBits:127568,versionNumber:31,alignmentPatternCenters:[6,30,56,82,108,134],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:13,dataCodewordsPerBlock:115},{numBlocks:3,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:46},{numBlocks:29,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:42,dataCodewordsPerBlock:24},{numBlocks:1,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:23,dataCodewordsPerBlock:15},
{numBlocks:28,dataCodewordsPerBlock:16}]}]},{infoBits:133589,versionNumber:32,alignmentPatternCenters:[6,34,60,86,112,138],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:115}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:46},{numBlocks:23,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:24},{numBlocks:35,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:19,
dataCodewordsPerBlock:15},{numBlocks:35,dataCodewordsPerBlock:16}]}]},{infoBits:136944,versionNumber:33,alignmentPatternCenters:[6,30,58,86,114,142],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:115},{numBlocks:1,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:14,dataCodewordsPerBlock:46},{numBlocks:21,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:29,dataCodewordsPerBlock:24},{numBlocks:19,dataCodewordsPerBlock:25}]},
{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:11,dataCodewordsPerBlock:15},{numBlocks:46,dataCodewordsPerBlock:16}]}]},{infoBits:141498,versionNumber:34,alignmentPatternCenters:[6,34,62,90,118,146],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:13,dataCodewordsPerBlock:115},{numBlocks:6,dataCodewordsPerBlock:116}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:14,dataCodewordsPerBlock:46},{numBlocks:23,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:44,
dataCodewordsPerBlock:24},{numBlocks:7,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:59,dataCodewordsPerBlock:16},{numBlocks:1,dataCodewordsPerBlock:17}]}]},{infoBits:145311,versionNumber:35,alignmentPatternCenters:[6,30,54,78,102,126,150],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:12,dataCodewordsPerBlock:121},{numBlocks:7,dataCodewordsPerBlock:122}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:12,dataCodewordsPerBlock:47},{numBlocks:26,dataCodewordsPerBlock:48}]},
{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:39,dataCodewordsPerBlock:24},{numBlocks:14,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:22,dataCodewordsPerBlock:15},{numBlocks:41,dataCodewordsPerBlock:16}]}]},{infoBits:150283,versionNumber:36,alignmentPatternCenters:[6,24,50,76,102,128,154],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:6,dataCodewordsPerBlock:121},{numBlocks:14,dataCodewordsPerBlock:122}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:6,
dataCodewordsPerBlock:47},{numBlocks:34,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:46,dataCodewordsPerBlock:24},{numBlocks:10,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:2,dataCodewordsPerBlock:15},{numBlocks:64,dataCodewordsPerBlock:16}]}]},{infoBits:152622,versionNumber:37,alignmentPatternCenters:[6,28,54,80,106,132,158],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:17,dataCodewordsPerBlock:122},{numBlocks:4,dataCodewordsPerBlock:123}]},
{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:29,dataCodewordsPerBlock:46},{numBlocks:14,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:49,dataCodewordsPerBlock:24},{numBlocks:10,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:24,dataCodewordsPerBlock:15},{numBlocks:46,dataCodewordsPerBlock:16}]}]},{infoBits:158308,versionNumber:38,alignmentPatternCenters:[6,32,58,84,110,136,162],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:4,
dataCodewordsPerBlock:122},{numBlocks:18,dataCodewordsPerBlock:123}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:13,dataCodewordsPerBlock:46},{numBlocks:32,dataCodewordsPerBlock:47}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:48,dataCodewordsPerBlock:24},{numBlocks:14,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:42,dataCodewordsPerBlock:15},{numBlocks:32,dataCodewordsPerBlock:16}]}]},{infoBits:161089,versionNumber:39,alignmentPatternCenters:[6,26,54,82,110,138,166],
errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:20,dataCodewordsPerBlock:117},{numBlocks:4,dataCodewordsPerBlock:118}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:40,dataCodewordsPerBlock:47},{numBlocks:7,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:43,dataCodewordsPerBlock:24},{numBlocks:22,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:10,dataCodewordsPerBlock:15},{numBlocks:67,dataCodewordsPerBlock:16}]}]},{infoBits:167017,
versionNumber:40,alignmentPatternCenters:[6,30,58,86,114,142,170],errorCorrectionLevels:[{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:19,dataCodewordsPerBlock:118},{numBlocks:6,dataCodewordsPerBlock:119}]},{ecCodewordsPerBlock:28,ecBlocks:[{numBlocks:18,dataCodewordsPerBlock:47},{numBlocks:31,dataCodewordsPerBlock:48}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:34,dataCodewordsPerBlock:24},{numBlocks:34,dataCodewordsPerBlock:25}]},{ecCodewordsPerBlock:30,ecBlocks:[{numBlocks:20,dataCodewordsPerBlock:15},
{numBlocks:61,dataCodewordsPerBlock:16}]}]}];function J(a,b){a^=b;for(b=0;a;)b++,a&=a-1;return b}function K(a,b){return b<<1|a}
let ia=[{bits:21522,formatInfo:{errorCorrectionLevel:1,dataMask:0}},{bits:20773,formatInfo:{errorCorrectionLevel:1,dataMask:1}},{bits:24188,formatInfo:{errorCorrectionLevel:1,dataMask:2}},{bits:23371,formatInfo:{errorCorrectionLevel:1,dataMask:3}},{bits:17913,formatInfo:{errorCorrectionLevel:1,dataMask:4}},{bits:16590,formatInfo:{errorCorrectionLevel:1,dataMask:5}},{bits:20375,formatInfo:{errorCorrectionLevel:1,dataMask:6}},{bits:19104,formatInfo:{errorCorrectionLevel:1,dataMask:7}},{bits:30660,formatInfo:{errorCorrectionLevel:0,
dataMask:0}},{bits:29427,formatInfo:{errorCorrectionLevel:0,dataMask:1}},{bits:32170,formatInfo:{errorCorrectionLevel:0,dataMask:2}},{bits:30877,formatInfo:{errorCorrectionLevel:0,dataMask:3}},{bits:26159,formatInfo:{errorCorrectionLevel:0,dataMask:4}},{bits:25368,formatInfo:{errorCorrectionLevel:0,dataMask:5}},{bits:27713,formatInfo:{errorCorrectionLevel:0,dataMask:6}},{bits:26998,formatInfo:{errorCorrectionLevel:0,dataMask:7}},{bits:5769,formatInfo:{errorCorrectionLevel:3,dataMask:0}},{bits:5054,
formatInfo:{errorCorrectionLevel:3,dataMask:1}},{bits:7399,formatInfo:{errorCorrectionLevel:3,dataMask:2}},{bits:6608,formatInfo:{errorCorrectionLevel:3,dataMask:3}},{bits:1890,formatInfo:{errorCorrectionLevel:3,dataMask:4}},{bits:597,formatInfo:{errorCorrectionLevel:3,dataMask:5}},{bits:3340,formatInfo:{errorCorrectionLevel:3,dataMask:6}},{bits:2107,formatInfo:{errorCorrectionLevel:3,dataMask:7}},{bits:13663,formatInfo:{errorCorrectionLevel:2,dataMask:0}},{bits:12392,formatInfo:{errorCorrectionLevel:2,
dataMask:1}},{bits:16177,formatInfo:{errorCorrectionLevel:2,dataMask:2}},{bits:14854,formatInfo:{errorCorrectionLevel:2,dataMask:3}},{bits:9396,formatInfo:{errorCorrectionLevel:2,dataMask:4}},{bits:8579,formatInfo:{errorCorrectionLevel:2,dataMask:5}},{bits:11994,formatInfo:{errorCorrectionLevel:2,dataMask:6}},{bits:11245,formatInfo:{errorCorrectionLevel:2,dataMask:7}}],ja=[a=>0===(a.y+a.x)%2,a=>0===a.y%2,a=>0===a.x%3,a=>0===(a.y+a.x)%3,a=>0===(Math.floor(a.y/2)+Math.floor(a.x/3))%2,a=>0===a.x*a.y%
2+a.x*a.y%3,a=>0===(a.y*a.x%2+a.y*a.x%3)%2,a=>0===((a.y+a.x)%2+a.y*a.x%3)%2];
function ka(a,b,c){c=ja[c.dataMask];let d=a.height;var e=17+4*b.versionNumber;let f=x.createEmpty(e,e);f.setRegion(0,0,9,9,!0);f.setRegion(e-8,0,8,9,!0);f.setRegion(0,e-8,9,8,!0);for(var g of b.alignmentPatternCenters)for(var h of b.alignmentPatternCenters)6===g&&6===h||6===g&&h===e-7||g===e-7&&6===h||f.setRegion(g-2,h-2,5,5,!0);f.setRegion(6,9,1,e-17,!0);f.setRegion(9,6,e-17,1,!0);6<b.versionNumber&&(f.setRegion(e-11,0,3,6,!0),f.setRegion(0,e-11,6,3,!0));b=[];h=g=0;e=!0;for(let k=d-1;0<k;k-=2){6===
k&&k--;for(let m=0;m<d;m++){let l=e?d-1-m:m;for(let n=0;2>n;n++){let q=k-n;if(!f.get(q,l)){h++;let r=a.get(q,l);c({y:l,x:q})&&(r=!r);g=g<<1|r;8===h&&(b.push(g),g=h=0)}}}e=!e}return b}
function la(a){var b=a.height,c=Math.floor((b-17)/4);if(6>=c)return I[c-1];c=0;for(var d=5;0<=d;d--)for(var e=b-9;e>=b-11;e--)c=K(a.get(e,d),c);d=0;for(e=5;0<=e;e--)for(let g=b-9;g>=b-11;g--)d=K(a.get(e,g),d);a=Infinity;let f;for(let g of I){if(g.infoBits===c||g.infoBits===d)return g;b=J(c,g.infoBits);b<a&&(f=g,a=b);b=J(d,g.infoBits);b<a&&(f=g,a=b)}if(3>=a)return f}
function ma(a){let b=0;for(var c=0;8>=c;c++)6!==c&&(b=K(a.get(c,8),b));for(c=7;0<=c;c--)6!==c&&(b=K(a.get(8,c),b));var d=a.height;c=0;for(var e=d-1;e>=d-7;e--)c=K(a.get(8,e),c);for(e=d-8;e<d;e++)c=K(a.get(e,8),c);a=Infinity;d=null;for(let {bits:f,formatInfo:g}of ia){if(f===b||f===c)return g;e=J(b,f);e<a&&(d=g,a=e);b!==c&&(e=J(c,f),e<a&&(d=g,a=e))}return 3>=a?d:null}
function na(a,b,c){let d=b.errorCorrectionLevels[c],e=[],f=0;d.ecBlocks.forEach(h=>{for(let k=0;k<h.numBlocks;k++)e.push({numDataCodewords:h.dataCodewordsPerBlock,codewords:[]}),f+=h.dataCodewordsPerBlock+d.ecCodewordsPerBlock});if(a.length<f)return null;a=a.slice(0,f);b=d.ecBlocks[0].dataCodewordsPerBlock;for(c=0;c<b;c++)for(var g of e)g.codewords.push(a.shift());if(1<d.ecBlocks.length)for(g=d.ecBlocks[0].numBlocks,b=d.ecBlocks[1].numBlocks,c=0;c<b;c++)e[g+c].codewords.push(a.shift());for(;0<a.length;)for(let h of e)h.codewords.push(a.shift());
return e}function L(a){let b=la(a);if(!b)return null;var c=ma(a);if(!c)return null;a=ka(a,b,c);var d=na(a,b,c.errorCorrectionLevel);if(!d)return null;c=d.reduce((e,f)=>e+f.numDataCodewords,0);c=new Uint8ClampedArray(c);a=0;for(let e of d){d=ha(e.codewords,e.codewords.length-e.numDataCodewords);if(!d)return null;for(let f=0;f<e.numDataCodewords;f++)c[a++]=d[f]}try{return da(c,b.versionNumber)}catch(e){return null}}
function M(a,b,c,d){var e=a.x-b.x+c.x-d.x;let f=a.y-b.y+c.y-d.y;if(0===e&&0===f)return{a11:b.x-a.x,a12:b.y-a.y,a13:0,a21:c.x-b.x,a22:c.y-b.y,a23:0,a31:a.x,a32:a.y,a33:1};let g=b.x-c.x;var h=d.x-c.x;let k=b.y-c.y,m=d.y-c.y;c=g*m-h*k;h=(e*m-h*f)/c;e=(g*f-e*k)/c;return{a11:b.x-a.x+h*b.x,a12:b.y-a.y+h*b.y,a13:h,a21:d.x-a.x+e*d.x,a22:d.y-a.y+e*d.y,a23:e,a31:a.x,a32:a.y,a33:1}}
function oa(a,b,c,d){a=M(a,b,c,d);return{a11:a.a22*a.a33-a.a23*a.a32,a12:a.a13*a.a32-a.a12*a.a33,a13:a.a12*a.a23-a.a13*a.a22,a21:a.a23*a.a31-a.a21*a.a33,a22:a.a11*a.a33-a.a13*a.a31,a23:a.a13*a.a21-a.a11*a.a23,a31:a.a21*a.a32-a.a22*a.a31,a32:a.a12*a.a31-a.a11*a.a32,a33:a.a11*a.a22-a.a12*a.a21}}
function pa(a,b){var c=oa({x:3.5,y:3.5},{x:b.dimension-3.5,y:3.5},{x:b.dimension-6.5,y:b.dimension-6.5},{x:3.5,y:b.dimension-3.5}),d=M(b.topLeft,b.topRight,b.alignmentPattern,b.bottomLeft),e=d.a11*c.a11+d.a21*c.a12+d.a31*c.a13,f=d.a12*c.a11+d.a22*c.a12+d.a32*c.a13,g=d.a13*c.a11+d.a23*c.a12+d.a33*c.a13,h=d.a11*c.a21+d.a21*c.a22+d.a31*c.a23,k=d.a12*c.a21+d.a22*c.a22+d.a32*c.a23,m=d.a13*c.a21+d.a23*c.a22+d.a33*c.a23,l=d.a11*c.a31+d.a21*c.a32+d.a31*c.a33,n=d.a12*c.a31+d.a22*c.a32+d.a32*c.a33,q=d.a13*
c.a31+d.a23*c.a32+d.a33*c.a33;c=x.createEmpty(b.dimension,b.dimension);d=(r,u)=>{const p=g*r+m*u+q;return{x:(e*r+h*u+l)/p,y:(f*r+k*u+n)/p}};for(let r=0;r<b.dimension;r++)for(let u=0;u<b.dimension;u++){let p=d(u+.5,r+.5);c.set(u,r,a.get(Math.floor(p.x),Math.floor(p.y)))}return{matrix:c,mappingFunction:d}}let N=(a,b)=>Math.sqrt(Math.pow(b.x-a.x,2)+Math.pow(b.y-a.y,2));function O(a){return a.reduce((b,c)=>b+c)}
function qa(a,b,c){let d=N(a,b),e=N(b,c),f=N(a,c),g,h,k;e>=d&&e>=f?[g,h,k]=[b,a,c]:f>=e&&f>=d?[g,h,k]=[a,b,c]:[g,h,k]=[a,c,b];0>(k.x-h.x)*(g.y-h.y)-(k.y-h.y)*(g.x-h.x)&&([g,k]=[k,g]);return{bottomLeft:g,topLeft:h,topRight:k}}
function ra(a,b,c,d){d=(O(P(a,c,d,5))/7+O(P(a,b,d,5))/7+O(P(c,a,d,5))/7+O(P(b,a,d,5))/7)/4;if(1>d)throw Error("Invalid module size");b=Math.round(N(a,b)/d);a=Math.round(N(a,c)/d);a=Math.floor((b+a)/2)+7;switch(a%4){case 0:a++;break;case 2:a--}return{dimension:a,moduleSize:d}}
function Q(a,b,c,d){let e=[{x:Math.floor(a.x),y:Math.floor(a.y)}];var f=Math.abs(b.y-a.y)>Math.abs(b.x-a.x);if(f){var g=Math.floor(a.y);var h=Math.floor(a.x);a=Math.floor(b.y);b=Math.floor(b.x)}else g=Math.floor(a.x),h=Math.floor(a.y),a=Math.floor(b.x),b=Math.floor(b.y);let k=Math.abs(a-g),m=Math.abs(b-h),l=Math.floor(-k/2),n=g<a?1:-1,q=h<b?1:-1,r=!0;for(let u=g,p=h;u!==a+n;u+=n){g=f?p:u;h=f?u:p;if(c.get(g,h)!==r&&(r=!r,e.push({x:g,y:h}),e.length===d+1))break;l+=m;if(0<l){if(p===b)break;p+=q;l-=k}}c=
[];for(f=0;f<d;f++)e[f]&&e[f+1]?c.push(N(e[f],e[f+1])):c.push(0);return c}function P(a,b,c,d){let e=b.y-a.y,f=b.x-a.x;b=Q(a,b,c,Math.ceil(d/2));a=Q(a,{x:a.x-f,y:a.y-e},c,Math.ceil(d/2));c=b.shift()+a.shift()-1;return a.concat(c).concat(...b)}function R(a,b){let c=O(a)/O(b),d=0;b.forEach((e,f)=>{d+=Math.pow(a[f]-e*c,2)});return{averageSize:c,error:d}}
function S(a,b,c){try{let d=P(a,{x:-1,y:a.y},c,b.length),e=P(a,{x:a.x,y:-1},c,b.length),f=P(a,{x:Math.max(0,a.x-a.y)-1,y:Math.max(0,a.y-a.x)-1},c,b.length),g=P(a,{x:Math.min(c.width,a.x+a.y)+1,y:Math.min(c.height,a.y+a.x)+1},c,b.length),h=R(d,b),k=R(e,b),m=R(f,b),l=R(g,b),n=(h.averageSize+k.averageSize+m.averageSize+l.averageSize)/4;return Math.sqrt(h.error*h.error+k.error*k.error+m.error*m.error+l.error*l.error)+(Math.pow(h.averageSize-n,2)+Math.pow(k.averageSize-n,2)+Math.pow(m.averageSize-n,2)+
Math.pow(l.averageSize-n,2))/n}catch(d){return Infinity}}function T(a,b){for(var c=Math.round(b.x);a.get(c,Math.round(b.y));)c--;for(var d=Math.round(b.x);a.get(d,Math.round(b.y));)d++;c=(c+d)/2;for(d=Math.round(b.y);a.get(Math.round(c),d);)d--;for(b=Math.round(b.y);a.get(Math.round(c),b);)b++;return{x:c,y:(d+b)/2}}
function sa(a){var b=[],c=[];let d=[];var e=[];for(let p=0;p<=a.height;p++){var f=0,g=!1;let t=[0,0,0,0,0];for(let v=-1;v<=a.width;v++){var h=a.get(v,p);if(h===g)f++;else{t=[t[1],t[2],t[3],t[4],f];f=1;g=h;var k=O(t)/7;k=Math.abs(t[0]-k)<k&&Math.abs(t[1]-k)<k&&Math.abs(t[2]-3*k)<3*k&&Math.abs(t[3]-k)<k&&Math.abs(t[4]-k)<k&&!h;var m=O(t.slice(-3))/3;h=Math.abs(t[2]-m)<m&&Math.abs(t[3]-m)<m&&Math.abs(t[4]-m)<m&&h;if(k){let z=v-t[3]-t[4],y=z-t[2];k={startX:y,endX:z,y:p};m=c.filter(w=>y>=w.bottom.startX&&
y<=w.bottom.endX||z>=w.bottom.startX&&y<=w.bottom.endX||y<=w.bottom.startX&&z>=w.bottom.endX&&1.5>t[2]/(w.bottom.endX-w.bottom.startX)&&.5<t[2]/(w.bottom.endX-w.bottom.startX));0<m.length?m[0].bottom=k:c.push({top:k,bottom:k})}if(h){let z=v-t[4],y=z-t[3];h={startX:y,y:p,endX:z};k=e.filter(w=>y>=w.bottom.startX&&y<=w.bottom.endX||z>=w.bottom.startX&&y<=w.bottom.endX||y<=w.bottom.startX&&z>=w.bottom.endX&&1.5>t[2]/(w.bottom.endX-w.bottom.startX)&&.5<t[2]/(w.bottom.endX-w.bottom.startX));0<k.length?
k[0].bottom=h:e.push({top:h,bottom:h})}}}b.push(...c.filter(v=>v.bottom.y!==p&&2<=v.bottom.y-v.top.y));c=c.filter(v=>v.bottom.y===p);d.push(...e.filter(v=>v.bottom.y!==p));e=e.filter(v=>v.bottom.y===p)}b.push(...c.filter(p=>2<=p.bottom.y-p.top.y));d.push(...e);c=[];for(var l of b)2>l.bottom.y-l.top.y||(b=(l.top.startX+l.top.endX+l.bottom.startX+l.bottom.endX)/4,e=(l.top.y+l.bottom.y+1)/2,a.get(Math.round(b),Math.round(e))&&(f=[l.top.endX-l.top.startX,l.bottom.endX-l.bottom.startX,l.bottom.y-l.top.y+
1],f=O(f)/f.length,g=S({x:Math.round(b),y:Math.round(e)},[1,1,3,1,1],a),c.push({score:g,x:b,y:e,size:f})));if(3>c.length)return null;c.sort((p,t)=>p.score-t.score);l=[];for(b=0;b<Math.min(c.length,5);++b){e=c[b];f=[];for(var n of c)n!==e&&f.push(Object.assign(Object.assign({},n),{score:n.score+Math.pow(n.size-e.size,2)/e.size}));f.sort((p,t)=>p.score-t.score);l.push({points:[e,f[0],f[1]],score:e.score+f[0].score+f[1].score})}l.sort((p,t)=>p.score-t.score);let {topRight:q,topLeft:r,bottomLeft:u}=qa(...l[0].points);
l=U(a,d,q,r,u);n=[];l&&n.push({alignmentPattern:{x:l.alignmentPattern.x,y:l.alignmentPattern.y},bottomLeft:{x:u.x,y:u.y},dimension:l.dimension,topLeft:{x:r.x,y:r.y},topRight:{x:q.x,y:q.y}});l=T(a,q);b=T(a,r);c=T(a,u);(a=U(a,d,l,b,c))&&n.push({alignmentPattern:{x:a.alignmentPattern.x,y:a.alignmentPattern.y},bottomLeft:{x:c.x,y:c.y},topLeft:{x:b.x,y:b.y},topRight:{x:l.x,y:l.y},dimension:a.dimension});return 0===n.length?null:n}
function U(a,b,c,d,e){let f,g;try{({dimension:f,moduleSize:g}=ra(d,c,e,a))}catch(l){return null}var h=c.x-d.x+e.x,k=c.y-d.y+e.y;c=(N(d,e)+N(d,c))/2/g;e=1-3/c;let m={x:d.x+e*(h-d.x),y:d.y+e*(k-d.y)};b=b.map(l=>{const n=(l.top.startX+l.top.endX+l.bottom.startX+l.bottom.endX)/4;l=(l.top.y+l.bottom.y+1)/2;if(a.get(Math.floor(n),Math.floor(l))){var q=S({x:Math.floor(n),y:Math.floor(l)},[1,1,1],a)+N({x:n,y:l},m);return{x:n,y:l,score:q}}}).filter(l=>!!l).sort((l,n)=>l.score-n.score);return{alignmentPattern:15<=
c&&b.length?b[0]:m,dimension:f}}
function V(a){var b=sa(a);if(!b)return null;for(let e of b){b=pa(a,e);var c=b.matrix;if(null==c)c=null;else{var d=L(c);if(d)c=d;else{for(d=0;d<c.width;d++)for(let f=d+1;f<c.height;f++)c.get(d,f)!==c.get(f,d)&&(c.set(d,f,!c.get(d,f)),c.set(f,d,!c.get(f,d)));c=L(c)}}if(c)return{binaryData:c.bytes,data:c.text,chunks:c.chunks,version:c.version,location:{topRightCorner:b.mappingFunction(e.dimension,0),topLeftCorner:b.mappingFunction(0,0),bottomRightCorner:b.mappingFunction(e.dimension,e.dimension),bottomLeftCorner:b.mappingFunction(0,
e.dimension),topRightFinderPattern:e.topRight,topLeftFinderPattern:e.topLeft,bottomLeftFinderPattern:e.bottomLeft,bottomRightAlignmentPattern:e.alignmentPattern},matrix:b.matrix}}return null}let ta={inversionAttempts:"attemptBoth",greyScaleWeights:{red:.2126,green:.7152,blue:.0722,useIntegerApproximation:!1},canOverwriteImage:!0};function W(a,b){Object.keys(b).forEach(c=>{a[c]=b[c]})}
function X(a,b,c,d={}){let e=Object.create(null);W(e,ta);W(e,d);d="onlyInvert"===e.inversionAttempts||"invertFirst"===e.inversionAttempts;var f="attemptBoth"===e.inversionAttempts||d;var g=e.greyScaleWeights,h=e.canOverwriteImage,k=b*c;if(a.length!==4*k)throw Error("Malformed data passed to binarizer.");var m=0;if(h){var l=new Uint8ClampedArray(a.buffer,m,k);m+=k}l=new A(b,c,l);if(g.useIntegerApproximation)for(var n=0;n<c;n++)for(var q=0;q<b;q++){var r=4*(n*b+q);l.set(q,n,g.red*a[r]+g.green*a[r+1]+
g.blue*a[r+2]+128>>8)}else for(n=0;n<c;n++)for(q=0;q<b;q++)r=4*(n*b+q),l.set(q,n,g.red*a[r]+g.green*a[r+1]+g.blue*a[r+2]);g=Math.ceil(b/8);n=Math.ceil(c/8);q=g*n;if(h){var u=new Uint8ClampedArray(a.buffer,m,q);m+=q}u=new A(g,n,u);for(q=0;q<n;q++)for(r=0;r<g;r++){var p=Infinity,t=0;for(var v=0;8>v;v++)for(let w=0;8>w;w++){let aa=l.get(8*r+w,8*q+v);p=Math.min(p,aa);t=Math.max(t,aa)}v=(p+t)/2;v=Math.min(255,1.11*v);24>=t-p&&(v=p/2,0<q&&0<r&&(t=(u.get(r,q-1)+2*u.get(r-1,q)+u.get(r-1,q-1))/4,p<t&&(v=t)));
u.set(r,q,v)}h?(q=new Uint8ClampedArray(a.buffer,m,k),m+=k,q=new x(q,b)):q=x.createEmpty(b,c);r=null;f&&(h?(a=new Uint8ClampedArray(a.buffer,m,k),r=new x(a,b)):r=x.createEmpty(b,c));for(b=0;b<n;b++)for(a=0;a<g;a++){c=g-3;c=2>a?2:a>c?c:a;h=n-3;h=2>b?2:b>h?h:b;k=0;for(m=-2;2>=m;m++)for(p=-2;2>=p;p++)k+=u.get(c+m,h+p);c=k/25;for(h=0;8>h;h++)for(k=0;8>k;k++)m=8*a+h,p=8*b+k,t=l.get(m,p),q.set(m,p,t<=c),f&&r.set(m,p,!(t<=c))}f=f?{binarized:q,inverted:r}:{binarized:q};let {binarized:z,inverted:y}=f;(f=V(d?
y:z))||"attemptBoth"!==e.inversionAttempts&&"invertFirst"!==e.inversionAttempts||(f=V(d?z:y));return f}X.default=X;let Y="dontInvert",Z={red:77,green:150,blue:29,useIntegerApproximation:!0};
self.onmessage=a=>{let b=a.data.id,c=a.data.data;switch(a.data.type){case "decode":(a=X(c.data,c.width,c.height,{inversionAttempts:Y,greyScaleWeights:Z}))?self.postMessage({id:b,type:"qrResult",data:a.data,cornerPoints:[a.location.topLeftCorner,a.location.topRightCorner,a.location.bottomRightCorner,a.location.bottomLeftCorner]}):self.postMessage({id:b,type:"qrResult",data:null});break;case "grayscaleWeights":Z.red=c.red;Z.green=c.green;Z.blue=c.blue;Z.useIntegerApproximation=c.useIntegerApproximation;
break;case "inversionMode":switch(c){case "original":Y="dontInvert";break;case "invert":Y="onlyInvert";break;case "both":Y="attemptBoth";break;default:throw Error("Invalid inversion mode");}break;case "close":self.close()}}
`]),{type:"application/javascript"}));

    var qrScannerWorker_min = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createWorker: createWorker
    });

})();
