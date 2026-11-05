from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from profiles.models import MemberProfile
from experiences.models import Experience
from forum.models import CommunityPost


PARTICIPANTS = [
    ("Aino", "Korhonen", 8, "Data Analyst", "Python, SQL, Power BI",
     "Data analytics, business intelligence", "data analyst",
     "How I built my first data analytics portfolio",
     "I created a portfolio using Python, SQL and Power BI. I started with public datasets, cleaned the data and built dashboards that explained business trends.",
     "My biggest lesson: a small finished portfolio project is more valuable than five unfinished ones."),

    ("Mikko", "Laine", 9, "Software Developer", "Python, Django, PostgreSQL",
     "Backend development, software engineering", "backend developer",
     "Preparing for a junior Python developer interview",
     "I reviewed Python fundamentals, Django REST APIs, database relationships and authentication. I also practised explaining my GitHub projects.",
     "For junior developer interviews, practise explaining why you made technical decisions."),

    ("Sara", "Nieminen", 10, "UX Designer", "Figma, User Research, Prototyping",
     "UX design, accessibility", "UX designer",
     "How user research improved my portfolio",
     "I interviewed potential users, identified their problems and redesigned my prototype in Figma. Showing the design process helped me explain my decisions.",
     "A useful UX portfolio explains the problem, research, design choices and results."),

    ("Omar", "Hassan", 7, "Cloud Engineer", "AWS, Linux, Docker",
     "Cloud infrastructure, DevOps", "cloud engineer",
     "My first cloud infrastructure project",
     "I deployed a small web application using Docker and AWS. I documented networking, security groups and deployment steps.",
     "Learning Linux and networking made cloud concepts much easier to understand."),

    ("Elina", "Virtanen", 11, "Marketing Specialist", "SEO, Analytics, Content Strategy",
     "Digital marketing, growth", "marketing specialist",
     "Finding my first digital marketing internship",
     "I improved my CV with measurable project outcomes and prepared a marketing campaign example before interviews.",
     "When applying for marketing roles, show actual campaign ideas and measurable outcomes."),

    ("Ravi", "Sharma", 9, "Full Stack Developer", "React, TypeScript, Node.js",
     "Web development, startups", "full stack developer",
     "Building a full stack project for my CV",
     "I developed a web application with React and Node.js, added authentication and deployed a working demo.",
     "A deployed application gives recruiters something concrete to explore."),

    ("Laura", "Salonen", 6, "HR Coordinator", "Recruitment, Communication, Excel",
     "Human resources, talent acquisition", "HR coordinator",
     "What I learned about Finnish recruitment",
     "I practised tailoring applications to job descriptions and preparing specific examples of teamwork and problem solving.",
     "Tailor your CV to each role and explain your achievements with specific examples."),

    ("Daniel", "Okafor", 10, "Cybersecurity Analyst", "Networking, Linux, Security",
     "Cybersecurity, SOC analysis", "cybersecurity analyst",
     "Preparing for an entry level cybersecurity role",
     "I studied networking fundamentals, Linux permissions and basic security monitoring. I documented a home lab project.",
     "A small cybersecurity home lab can demonstrate practical learning."),

    ("Neha", "Patel", 8, "Business Analyst", "Excel, SQL, Power BI",
     "Business analysis, consulting", "business analyst",
     "How I prepared for a business analyst interview",
     "I practised requirements gathering, stakeholder communication and interpreting business data with SQL and Excel.",
     "Business analysts need to communicate findings clearly, not just produce charts."),

    ("Joonas", "Mäkinen", 11, "Mechanical Engineer", "CAD, SolidWorks, Project Management",
     "Product development, manufacturing", "mechanical engineer",
     "Networking helped me find an engineering opportunity",
     "I attended career events, discussed engineering projects with professionals and followed up with personalised messages.",
     "Professional networking works best when conversations are genuine and specific."),

    ("Fatima", "Ali", 7, "Project Coordinator", "Agile, Jira, Communication",
     "Project management, operations", "project coordinator",
     "My first experience working in an Agile team",
     "I helped organise sprint planning, tracked tasks in Jira and facilitated communication between team members.",
     "Clear task ownership and regular updates make teamwork more effective."),

    ("Antti", "Heikkinen", 6, "IT Support Specialist", "Windows, Linux, Networking",
     "IT support, system administration", "IT support specialist",
     "Preparing for an IT support technical interview",
     "I practised troubleshooting network connections, operating system issues and common user support scenarios.",
     "When troubleshooting, explain your reasoning step by step instead of guessing."),
]


class Command(BaseCommand):
    help = "Create or update fictional Career Club demo participants"

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()

        for first, last, round_number, role, skills, interests, slug, title, story, advice in PARTICIPANTS:
            username = f"demo_{first.lower()}_{last.lower()}"

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "email": f"{username}@example.com",
                    "is_active": False,
                },
            )

            if created:
                user.set_unusable_password()
                user.save(update_fields=["password"])

            MemberProfile.objects.update_or_create(
                user=user,
                defaults={
                    "career_club_round": round_number,
                    "bio": f"{role} interested in professional development, practical projects and connecting with other Career Club participants.",
                    "skills": skills,
                    "career_interests": interests,
                },
            )

            category_by_title = {
                "How I built my first data analytics portfolio": Experience.Category.OTHER,
                "Preparing for a junior Python developer interview": Experience.Category.INTERVIEW,
                "How user research improved my portfolio": Experience.Category.OTHER,
                "My first cloud infrastructure project": Experience.Category.OTHER,
                "Finding my first digital marketing internship": Experience.Category.INTERNSHIP,
                "Building a full stack project for my CV": Experience.Category.JOB_APPLICATION,
                "What I learned about Finnish recruitment": Experience.Category.JOB_APPLICATION,
                "Preparing for an entry level cybersecurity role": Experience.Category.INTERVIEW,
                "How I prepared for a business analyst interview": Experience.Category.INTERVIEW,
                "Networking helped me find an engineering opportunity": Experience.Category.NETWORKING,
                "My first experience working in an Agile team": Experience.Category.INTERNSHIP,
                "Preparing for an IT support technical interview": Experience.Category.INTERVIEW,
            }

            detailed_story = (
                f"MY EXPERIENCE\n\n{story}\n\n"
                f"WHAT I LEARNED\n\n{advice}\n\n"
                "MY ADVICE TO OTHER MEMBERS\n\n"
                "Start with one practical goal, document what you learn, "
                "and practise explaining your work using specific examples. "
                "Ask for feedback from other Career Club members and "
                "improve your approach based on what you discover."
            )

            Experience.objects.update_or_create(
                author=user,
                title=title,
                defaults={
                    "category": category_by_title[title],
                    "content": detailed_story,
                    "status": Experience.Status.APPROVED,
                    "publish_anonymously": False,
                },
            )

            CommunityPost.objects.update_or_create(
                author=user,
                content=advice,
                defaults={"category": CommunityPost.Category.CAREER_ADVICE},
            )

            self.stdout.write(
                f"{'Created' if created else 'Updated'}: {first} {last} (Round {round_number})"
            )

        self.stdout.write(
            self.style.SUCCESS("12 fictional participants seeded successfully.")
        )
