-- Development seed only. Contains published Mystery Room case material and evidence.
-- Excludes member notes, submissions, discussion posts, editorial reviews and admin IDs.
-- Run only after the Mystery Room schema candidate has been installed.
begin;
insert into public.mystery_cases
(id,slug,category,title,subtitle,synopsis,hero_image_url,status,is_free_preview,published_at,created_at,updated_at)
values
('3601c80d-ac1e-4f13-a4bc-21f97efa7d2b','enfield-poltergeist-1977','paranormal','The Enfield Poltergeist','Enfield, North London · 1977–1979','A family reported unexplained knocks, moving furniture and a voice unlike the child said to be producing it. Investigators, journalists, police officers and sceptics left behind a record that is still argued over. Examine the accounts and decide what the evidence can support.','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=85','published',true,'2026-11-23T15:43:13.702603+00:00','2026-11-23T15:43:13.702603+00:00','2026-11-23T15:43:13.702603+00:00'),
('1d421874-3d39-4675-bce9-ba04fc605e3f','zodiac-killer-four-confirmed-attacks','crime','The Zodiac Killer: The Four Confirmed Attacks','Northern California · 1968–1969','Examine the four attacks authorities have consistently associated with the Zodiac case, the letters sent to newspapers, the ciphers and the distinction between verified crimes and the killer’s wider claims.',null,'published',false,'2026-11-23T19:41:31.432021+00:00','2026-11-23T15:47:21.769036+00:00','2026-11-23T19:41:31.432021+00:00')
on conflict (id) do update set
 slug=excluded.slug,category=excluded.category,title=excluded.title,subtitle=excluded.subtitle,
 synopsis=excluded.synopsis,hero_image_url=excluded.hero_image_url,status=excluded.status,
 is_free_preview=excluded.is_free_preview,published_at=excluded.published_at,updated_at=excluded.updated_at;

insert into public.mystery_case_content
(case_id,case_background,editorial_context,updated_at,investigation_questions)
values
('1d421874-3d39-4675-bce9-ba04fc605e3f','The Zodiac case centres on a series of attacks in Northern California between December 1968 and October 1969. The San Francisco Chronicle’s published timeline records the attacks at Lake Herman Road, Blue Rock Springs, Lake Berryessa and Presidio Heights. Five people were killed and two survived in those four attacks.

The person who called himself Zodiac also sent letters and ciphers to newspapers. Some letters claimed responsibility for attacks and included details or material connected to the crimes. The writer made much larger claims about the number of victims, but the Chronicle reports that authorities have confirmed four attacks and five deaths.

The FBI Vault contains released investigative records relating to the case. The available files include correspondence about suspected individuals, fingerprint examinations and documents supplied by local police departments. These records are incomplete and contain redactions. A document showing that a person was investigated does not establish that the person committed the crimes.

This investigation is deliberately limited to the four confirmed attacks and the associated correspondence. It does not treat other murders, disappearances or alleged encounters as Zodiac crimes unless authorities have formally linked them.','This case file is a research draft. The main public sources used so far are the San Francisco Chronicle’s historical timeline and the FBI Vault’s released case records. The Chronicle is a secondary source that reproduces archive material and reports the officially attributed attack count. FBI records are primary government documents but are partial, redacted and must be read in context. Suspect references are not proof of guilt.','2026-11-23T15:47:21.769036+00:00','[{"id":"q1","question":"Which parts of the four-attack timeline are supported by contemporary reporting or official records?"},{"id":"q2","question":"What did the letters and enclosed material add to the investigation beyond the writer’s own claims?"},{"id":"q3","question":"How should investigators separate confirmed attacks from crimes the letter writer claimed or hinted at?"},{"id":"q4","question":"What can the released FBI records establish about the investigation, and what can they not establish?"},{"id":"q5","question":"Which unanswered question would you investigate first, and what original record would you want to examine?"}]'::jsonb),
('3601c80d-ac1e-4f13-a4bc-21f97efa7d2b','On 31 August 1977, Peggy Hodgson and her children reported strange noises in their home at 284 Green Street, Enfield. The Society for Psychical Research (SPR) account says that a chest of drawers moved in the children’s bedroom and that neighbours were called. Police officers attended during the early hours of 1 September. One officer, WPC Caroline Heeps, later gave investigators an account of hearing knocks and seeing a chair slide several feet across the living-room floor.

The story attracted newspaper attention. SPR investigators Maurice Grosse and Guy Lyon Playfair became closely involved, making repeated visits and recording accounts of events. The disturbances described over the following months included knocks, moving objects and a harsh voice associated with Janet Hodgson. The SPR article reports that more than 180 hours of recordings were made.

The case was never accepted unanimously. Grosse and Playfair acknowledged that the girls had sometimes tried to trick investigators. Other SPR members and outside critics questioned the reliability of particular incidents, photographs and the voice. An SPR committee concluded that there was good evidence for some paranormal phenomena described by credible witnesses, while reserving judgement on incidents that were not clearly observed or where witness reliability was uncertain.

This file brings together a selection of documented accounts and later assessments. It does not treat every reported event as established fact. Read each item, note who recorded it and when, and consider what it can and cannot demonstrate.','The surviving public record includes witness accounts, investigator reports, recordings, press and television coverage, and later criticism. Some evidence is available only through later summaries or references to archives. The case should be assessed incident by incident; evidence that one event was staged does not automatically settle every other report, and an unexplained event does not by itself establish a paranormal cause.','2026-11-23T15:43:13.702603+00:00','[{"id":"q1","question":"What do you regard as the strongest piece of evidence in this case, and why?"},{"id":"q2","question":"Which accounts are first-hand, and which depend on later retelling or an investigator’s summary?"},{"id":"q3","question":"How should the admitted attempts at trickery affect your assessment of the other reported incidents?"},{"id":"q4","question":"Does the SPR committee’s conclusion go further than the material it reviewed allows? Explain your view."},{"id":"q5","question":"What additional original records or tests would you want to examine before reaching a firm conclusion?"}]'::jsonb)
on conflict (case_id) do update set
 case_background=excluded.case_background,editorial_context=excluded.editorial_context,
 updated_at=excluded.updated_at,investigation_questions=excluded.investigation_questions;

insert into public.mystery_evidence
(id,case_id,title,evidence_type,description,body,source_label,source_url,file_url,is_preview,display_order,created_at)
values
('9f7eb8b7-3acc-493c-abdc-80c45943d14b','1d421874-3d39-4675-bce9-ba04fc605e3f','Four attacks in the confirmed timeline','timeline','A chronological outline of the four attacks the San Francisco Chronicle identifies as officially attributed to the Zodiac.','20 December 1968 — David Faraday and Betty Lou Jensen were killed on Lake Herman Road in Benicia.

4 July 1969 — Darlene Ferrin was killed and Michael Mageau survived a shooting at Blue Rock Springs Park in Vallejo.

27 September 1969 — Cecelia Shepard was fatally stabbed and Bryan Hartnell survived an attack at Lake Berryessa.

11 October 1969 — Taxi driver Paul Stine was shot and killed in Presidio Heights, San Francisco.

The Chronicle reports five people killed and two survivors across these four attacks. Keep this established sequence separate from other incidents that have been linked to Zodiac by claims, theories or later speculation.','San Francisco Chronicle · historical timeline, 24 June 2021','https://www.sfchronicle.com/projects/zodiac-timeline/',null,false,1,'2026-11-23T15:47:21.769036+00:00'),
('2f62e9cd-cb14-4ba1-983d-a3159466cfaf','1d421874-3d39-4675-bce9-ba04fc605e3f','The first newspaper letters and the 408-character cipher','document','The Chronicle timeline describes three letters mailed to Bay Area newspapers in July 1969, each containing part of a cipher.','The Chronicle reports that on 31 July 1969, similar letters were sent to the San Francisco Chronicle, San Francisco Examiner and Vallejo Times-Herald. Each carried part of a cipher. The combined message was later decoded.

The letter writer claimed responsibility for the first two attacks. The letters and cipher helped bring the case to wider public attention, but a claim of responsibility must still be assessed against independently established details.

When examining the cipher, consider whether the solved message identifies the writer or merely reveals information and statements chosen by the sender.','San Francisco Chronicle · historical timeline, 24 June 2021','https://www.sfchronicle.com/projects/zodiac-timeline/',null,false,2,'2026-11-23T15:47:21.769036+00:00'),
('713ef7cf-0b40-4dea-bfdc-b56c43a83c01','1d421874-3d39-4675-bce9-ba04fc605e3f','The Paul Stine letter and shirt fragment','document','A letter sent after the Presidio Heights murder included a piece of the victim’s shirt. The Chronicle timeline records the newspaper’s publication of the letter.','Paul Stine was killed on 11 October 1969. The Chronicle reports that a letter published on 15 October claimed responsibility and included a bloody piece of Stine’s shirt.

This is a particularly important item to examine because the enclosed material was not simply a boast in the letter. The investigation should consider how the fragment was identified, who handled it, how it was preserved and what conclusions it could reasonably support.

The newspaper timeline is a secondary account. The original letter, envelope, forensic records and chain-of-custody documents would be needed for a full examination.','San Francisco Chronicle · historical timeline, 24 June 2021','https://www.sfchronicle.com/projects/zodiac-timeline/',null,false,3,'2026-11-23T15:47:21.769036+00:00'),
('9900e5ea-dda5-49ed-b3c8-edf1ca945cf6','1d421874-3d39-4675-bce9-ba04fc605e3f','FBI file: fingerprint enquiries and suspect references','document','A released FBI document from August 1970 records a request to compare a named person’s fingerprints with unidentified latent prints in the Zodiac investigation. The name and other personal details are redacted.','The FBI Vault file includes an Airtel dated 20 August 1970. It records that a police officer had reported an individual as a suspect and requests comparison of that person’s fingerprints with unidentified latent prints previously developed in the case.

A subsequent FBI fingerprint report in the same file is partly obscured. The visible text is not sufficient to identify the person or establish the full outcome of every comparison.

This document shows that investigators pursued a fingerprint comparison. It does not establish that the person named in the original document was responsible for the crimes.','Federal Bureau of Investigation · The Zodiac Killer, Part 04, pages in released file','https://vault.fbi.gov/The%20Zodiac%20Killer/The%20Zodiac%20Killer%20Part%2004/',null,false,4,'2026-11-23T15:47:21.769036+00:00'),
('2a459d79-9472-422a-b036-9088d5f2d856','1d421874-3d39-4675-bce9-ba04fc605e3f','The claims beyond the confirmed attacks','report','The letter writer claimed a much higher victim count. The Chronicle timeline distinguishes those claims from the attacks officially attributed to the case.','The Chronicle timeline records later letters in which the writer claimed responsibility for further killings and referred to other possible victims. It also notes incidents such as the Kathleen Johns encounter and the 1966 murder of Cheri Jo Bates were not officially attributed to Zodiac.

A claim made by the letter writer is evidence that the writer made the claim. It is not, by itself, proof that the writer committed the crime described.

For this investigation, keep a separate list of:
• Confirmed attacks associated with the Zodiac case.
• Incidents claimed by the letter writer but not officially attributed.
• Later theories and proposed links that remain disputed.','San Francisco Chronicle · historical timeline, 24 June 2021','https://www.sfchronicle.com/projects/zodiac-timeline/',null,false,5,'2026-11-23T15:47:21.769036+00:00'),
('e3647f33-e49b-4351-a0e5-a7ed79bba8c4','3601c80d-ac1e-4f13-a4bc-21f97efa7d2b','The first reported disturbance · 31 August 1977','document','The SPR account places the first reported disturbance at around 9.30 pm on 31 August 1977. This is a later published summary of the case record, not the original police log.','According to the SPR account, Janet and John Hodgson heard shuffling in their bedroom. Their mother joined them and they heard knocking. A chest of drawers was said to have moved approximately eighteen inches without anyone touching it. The family called their neighbours, Vic and Gary Nottingham, who also reported hearing knocks.

Questions to consider:
• Who was present when the chest was said to move?
• Which parts of this account are direct witness recollections?
• What contemporaneous record would help confirm the sequence and timing?','Society for Psychical Research · Psi Encyclopedia','https://psi-encyclopedia.spr.ac.uk/articles/enfield-poltergeist/',null,true,1,'2026-11-23T15:43:13.702603+00:00'),
('6c4e88fe-250c-43c1-a922-bf35f28e33ba','3601c80d-ac1e-4f13-a4bc-21f97efa7d2b','Police attendance · WPC Heeps’s account','document','A police officer’s account is reproduced in the SPR article, which cites the SPR archive report. The text is a published transcription, not an independently authenticated copy of the original statement.','The SPR article reproduces an account attributed to WPC Caroline Heeps. She described hearing distinct knocks on different walls. After others went to check the kitchen and pipes, she said she saw a chair wobble and then slide approximately three to four feet across the floor. She stated that the chair did not appear to leave the floor and that she could find nothing to explain its movement.

Questions to consider:
• What exactly does the officer say she saw?
• What did she not claim to have seen?
• How would lighting, positioning and the presence of other people affect the reliability of the observation?','Society for Psychical Research · account attributed to WPC Caroline Heeps','https://psi-encyclopedia.spr.ac.uk/articles/enfield-poltergeist/',null,true,2,'2026-11-23T15:43:13.702603+00:00'),
('5cf828f4-8843-45a2-879a-c96d04844528','3601c80d-ac1e-4f13-a4bc-21f97efa7d2b','The investigators and the recordings','report','A summary of the work carried out by Maurice Grosse and Guy Lyon Playfair.','The SPR article states that Guy Playfair joined Maurice Grosse on 12 September 1977. It reports that they made around 180 visits and 25 all-night vigils, and that recordings made by Grosse and Playfair eventually totalled more than 180 hours.

The volume of recorded material gives researchers something to examine, but the total number of hours does not tell us how many recordings are complete, independently corroborated or available for public review. The provenance and context of each recording should be considered separately.','Society for Psychical Research · Psi Encyclopedia','https://psi-encyclopedia.spr.ac.uk/articles/enfield-poltergeist/',null,true,3,'2026-11-23T15:43:13.702603+00:00'),
('699dfda6-39fd-4e47-940e-ff321d55bd9c','3601c80d-ac1e-4f13-a4bc-21f97efa7d2b','The SPR committee’s assessment · 1978','report','A summary of the committee established by the Society for Psychical Research in May 1978.','The SPR article says the committee interviewed witnesses and considered much of the testimony clear and convincing. Its reported conclusion was that there was good evidence for paranormal phenomena described by credible informants. It also reserved judgement on incidents that could not have been clearly observed or where witnesses were not entirely convincing.

Read the wording carefully. The committee’s reported conclusion was qualified; it did not certify every incident or every claim made during the investigation.','Society for Psychical Research · summary of the Enfield Committee report','https://psi-encyclopedia.spr.ac.uk/articles/enfield-poltergeist/',null,true,4,'2026-11-23T15:43:13.702603+00:00'),
('4cc91148-fa8c-4b58-b7c5-371e3d573579','3601c80d-ac1e-4f13-a4bc-21f97efa7d2b','The attempts at trickery and the sceptical objections','report','The SPR article records admissions of trickery and criticisms from other investigators and sceptics.','The SPR article says Grosse and Playfair acknowledged that Margaret and Janet had sometimes tried to trick them. It also records Janet later saying that they cheated about two per cent of the time.

The article describes criticism from SPR member Anita Gregory, who questioned the girls’ behaviour and the reliability of parts of the investigation. Other critics challenged photographs and argued that some incidents could be explained as pranks. Grosse and Playfair disputed those conclusions and maintained that trickery did not explain the case as a whole.

Questions to consider:
• Does evidence of trickery undermine every incident equally?
• Which claims were witnessed by people outside the family?
• Were the observations made under conditions that ruled out ordinary explanations?','Society for Psychical Research · Controversy and Scepticism section','https://psi-encyclopedia.spr.ac.uk/articles/enfield-poltergeist/',null,true,5,'2026-11-23T15:43:13.702603+00:00'),
('4af60767-0d38-44d0-9f90-ae740f48802c','3601c80d-ac1e-4f13-a4bc-21f97efa7d2b','BBC Nationwide broadcast · 23 November 1977','video','A contemporary television report from the BBC Archive. The programme is an original broadcast source, although the online upload is a later archive publication.','The BBC Archive has published a clip from Nationwide, originally broadcast on BBC One on 23 November 1977. It reports from Enfield while the disturbances were being investigated and includes contemporary coverage of the claims and the views of investigator Maurice Grosse.

Watch the report and note:
• What the reporter personally observes.
• What is presented as a claim by the family or investigators.
• What the programme does not independently establish.','BBC Archive · Nationwide, 23 November 1977','https://www.youtube.com/watch?v=_iqvDOEcjsM',null,true,6,'2026-11-23T15:43:13.702603+00:00')
on conflict (id) do update set
 title=excluded.title,evidence_type=excluded.evidence_type,description=excluded.description,
 body=excluded.body,source_label=excluded.source_label,source_url=excluded.source_url,
 file_url=excluded.file_url,is_preview=excluded.is_preview,display_order=excluded.display_order;

commit;
