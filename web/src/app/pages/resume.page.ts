import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ExperienceItem {
  role: string;
  org: string;
  period: string;
  bullets: string[];
}

@Component({
  selector: 'app-resume',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <section class="container section narrow">
      <div class="head">
        <div>
          <h1>Danilo Marques</h1>
          <p class="muted">Fullstack Developer · .NET | Angular | DevOps · Campo Largo, PR — Brazil</p>
        </div>
        <a mat-flat-button color="primary" href="/Danilo_Marques_CV.pdf" download>
          <mat-icon>download</mat-icon> Download PDF
        </a>
      </div>

      <h2>Profile</h2>
      <p>
        Fullstack developer with 4+ years of solid experience in .NET (C#) and Angular —
        from designing critical systems to integrating external APIs and cloud services.
        Proven in process automation, relational databases and CI/CD pipelines. Currently
        pursuing an MBA in DevOps & Cloud Computing (AWS focus). Advanced English (Cambridge C1).
      </p>

      <h2>Experience</h2>
      @for (e of experience; track e.role + e.org) {
        <div class="item">
          <div class="item-head">
            <strong>{{ e.role }} · {{ e.org }}</strong>
            <span class="muted">{{ e.period }}</span>
          </div>
          <ul>@for (b of e.bullets; track b) { <li>{{ b }}</li> }</ul>
        </div>
      }

      <h2>Skills</h2>
      <div class="skills">
        @for (group of skills; track group.label) {
          <div class="skill-group">
            <strong>{{ group.label }}</strong>
            <div class="chips">@for (s of group.items; track s) { <span class="chip">{{ s }}</span> }</div>
          </div>
        }
      </div>

      <h2>Education</h2>
      <ul>
        <li><strong>MBA — DevOps & Cloud Computing</strong>, Universidade Positivo (2024 – present)</li>
        <li><strong>BSc in Computer Science</strong>, Universidade Positivo (2023 – present)</li>
      </ul>

      <h2>Languages</h2>
      <ul>
        <li>Portuguese — Native</li>
        <li>English — Advanced, Cambridge C1 (C2 in progress)</li>
      </ul>
    </section>
  `,
  styles: `
    .narrow { max-width: 800px; }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
    h1 { font-size: 2.2rem; margin: 0; }
    h2 { margin: 2rem 0 0.75rem; font-size: 1.3rem; border-bottom: 1px solid var(--pw-border); padding-bottom: 0.4rem; }
    .head mat-icon { margin-right: 4px; }
    .item { margin-bottom: 1.25rem; }
    .item-head { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    ul { margin: 0.5rem 0; padding-left: 1.2rem; }
    li { margin: 0.3rem 0; }
    .skills { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    .chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
    .chip { font-size: 0.78rem; padding: 0.25rem 0.7rem; border-radius: 999px; background: var(--pw-surface); border: 1px solid var(--pw-border); }
  `,
})
export default class Resume {
  readonly experience: ExperienceItem[] = [
    {
      role: 'Fullstack Developer',
      org: 'GERAR Org',
      period: 'Jan 2022 – present',
      bullets: [
        'Architected a fullstack corporate platform with Google OAuth 2.0, multiple modules under a single Angular codebase with per-module lazy loading.',
        'Events module with two-way Google Calendar API sync (create/update/cancel).',
        'Power-of-attorney and official-documents modules with status tracking and automatic numbering, replacing manual spreadsheet control.',
        'Custom voting system with anonymity-by-design (voter identity separated from the recorded vote) and real-time results.',
        'Containerized the whole solution with Docker for consistent dev/prod deploys.',
      ],
    },
    {
      role: 'Personal Project — Point of Sale (POS)',
      org: 'Self',
      period: '2023 – 2024',
      bullets: [
        'Built a POS app from scratch with integrated inventory management and minimum-stock alerts.',
        'Full sales flow with change calculation, discounts and thermal-printer ticket printing.',
        'Layered REST API in .NET (Controller/Service/Repository) with Clean Code principles.',
      ],
    },
  ];

  readonly skills = [
    { label: 'Backend', items: ['.NET / C# (4y)', 'ASP.NET Core', 'Python (automation)', 'REST APIs'] },
    { label: 'Frontend', items: ['Angular 17–22 (4y)', 'TypeScript', 'RxJS', 'HTML5 / CSS3'] },
    { label: 'Databases', items: ['PostgreSQL', 'SQL Server / Oracle', 'MySQL', 'MongoDB'] },
    { label: 'Cloud & DevOps', items: ['AWS (SES, Lambda)', 'Docker', 'GitHub Actions', 'EKS / SNS / SQS / RDS'] },
  ];
}
